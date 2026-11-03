import { useEffect, useState } from "react";
import InputField from "../components/InputField";
import Alert from "../components/Alert";
import { createOrganization, uploadLogo } from "../services/organizationService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_MB = 2;

const emptyForm = {
  name: "",
  logoUrl: "",
  contactEmail: "",
  street: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
};

export default function OrganizationSetupPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  // Clean up the temporary preview URL
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "logoUrl") setLocalPreview("");
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, logoUrl: "Only PNG, JPG or WEBP images are allowed" }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, logoUrl: `Logo must be smaller than ${MAX_MB} MB` }));
      return;
    }

    setErrors((p) => ({ ...p, logoUrl: "" }));
    setLocalPreview(URL.createObjectURL(file));

    setUploading(true);
    const result = await callApi(() => uploadLogo(file));
    setUploading(false);

    if (result.ok) {
      const d = result.data || {};
      const url = d.url || d.logoUrl || d.fileUrl || "";
      if (url) {
        setForm((f) => ({ ...f, logoUrl: url }));
        setAlert({ type: "success", message: "Logo uploaded successfully." });
      } else {
        setErrors((p) => ({ ...p, logoUrl: "Upload worked but no file URL was returned." }));
      }
    } else {
      setLocalPreview("");
      setErrors((p) => ({
        ...p,
        logoUrl: `Logo upload failed: ${getErrorMessage(result)}`,
      }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Company name is required";
    if (form.logoUrl.trim() && !/^https?:\/\/\S+$/.test(form.logoUrl.trim()))
      e.logoUrl = "Enter a valid URL starting with http:// or https://";
    if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) e.contactEmail = "Enter a valid email address";
    if (!form.street.trim()) e.street = "Street is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Pincode must be 6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    if (uploading) {
      setAlert({ type: "error", message: "Please wait for the logo upload to finish." });
      return;
    }
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      logoUrl: form.logoUrl.trim(),
      contactEmail: form.contactEmail.trim(),
      address: {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        pincode: form.pincode.trim(),
      },
    };

    setLoading(true);
    const result = await callApi(() => createOrganization(payload));
    setLoading(false);

    if (result.ok) {
      setAlert({ type: "success", message: "Organization saved successfully!" });
      setForm(emptyForm);
      setLocalPreview("");
    } else if (result.status === 401 || result.status === 403) {
      setAlert({ type: "error", message: "Access denied. Please login again as Super Admin." });
    } else {
      setAlert({ type: "error", message: getErrorMessage(result) });
    }
  };

  const preview = localPreview || form.logoUrl.trim();

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-bold text-gray-800">Organization Setup</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">Enter your company details.</p>

      <Alert type={alert.type} message={alert.message} />

      <form onSubmit={handleSubmit} noValidate>
        <InputField label="Company Name" name="name" placeholder="Your company name"
          value={form.name} onChange={handleChange} error={errors.name} />

        {/* Logo upload */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Company Logo</label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
              {preview ? (
                <img src={preview} alt="Logo preview" className="h-full w-full object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")} />
              ) : (
                "No logo"
              )}
            </div>
            <label
              className={`cursor-pointer rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {uploading ? "Uploading..." : "Choose Logo"}
              <input type="file" accept="image/png,image/jpeg,image/webp"
                className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG or WEBP, max {MAX_MB} MB</p>
        </div>

        <InputField label="Or paste a logo URL" name="logoUrl" placeholder="https://..."
          value={form.logoUrl} onChange={handleChange} error={errors.logoUrl} />

        <InputField label="Contact Email" name="contactEmail" type="email"
          placeholder="admin@company.com"
          value={form.contactEmail} onChange={handleChange} error={errors.contactEmail} />

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase text-gray-500">Address</h2>

        <InputField label="Street" name="street" placeholder="Street / Area"
          value={form.street} onChange={handleChange} error={errors.street} />

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <InputField label="City" name="city" placeholder="City"
            value={form.city} onChange={handleChange} error={errors.city} />
          <InputField label="State" name="state" placeholder="State"
            value={form.state} onChange={handleChange} error={errors.state} />
          <InputField label="Country" name="country" placeholder="Country"
            value={form.country} onChange={handleChange} error={errors.country} />
          <InputField label="Pincode" name="pincode" placeholder="6-digit pincode"
            value={form.pincode} onChange={handleChange} error={errors.pincode} />
        </div>

        <button disabled={loading || uploading}
          className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Saving..." : "Save Organization"}
        </button>
      </form>
    </div>
  );
}