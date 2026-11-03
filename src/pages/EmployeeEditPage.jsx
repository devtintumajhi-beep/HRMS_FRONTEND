import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import InputField from "../components/InputField";
import Alert from "../components/Alert";
import { getEmployeeById, updateEmployee } from "../services/employeeService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

// Confirm the allowed status values with Naresh
const STATUSES = ["ACTIVE", "INACTIVE"];

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => getEmployeeById(id));
      if (result.ok) {
        const d = result.data;
        setForm({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          email: d.email || "",
          phone: d.phone || "",
          status: d.status || "ACTIVE",
        });
        setLoaded(true);
      } else if (result.status === 404) {
        setAlert({ type: "error", message: "Employee not found." });
      } else {
        setAlert({ type: "error", message: getErrorMessage(result) });
      }
      setLoading(false);
    })();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Phone must be 10 digits";
    if (!form.status) e.status = "Select a status";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    if (!validate()) return;

    setSaving(true);
    const result = await callApi(() =>
      updateEmployee(id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
      })
    );
    setSaving(false);

    if (result.ok) {
      setAlert({ type: "success", message: "Employee updated successfully! Redirecting..." });
      setTimeout(() => navigate(`/employees/${id}`), 1500);
    } else if (result.status === 401 || result.status === 403) {
      setAlert({ type: "error", message: "Access denied. Please login again." });
    } else {
      setAlert({ type: "error", message: getErrorMessage(result) });
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <Link to="/employees" className="text-sm text-blue-600 hover:underline">
        ← Back to Employees
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-bold text-gray-800">Edit Employee</h1>

      <Alert type={alert.type} message={alert.message} />
      {loading && <p className="text-gray-400">Loading employee...</p>}

      {loaded && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <InputField label="First Name" name="firstName" value={form.firstName}
              onChange={handleChange} error={errors.firstName} />
            <InputField label="Last Name" name="lastName" value={form.lastName}
              onChange={handleChange} error={errors.lastName} />
          </div>
          <InputField label="Email" name="email" type="email" value={form.email}
            onChange={handleChange} error={errors.email} />
          <InputField label="Phone" name="phone" value={form.phone}
            onChange={handleChange} error={errors.phone} />
          <InputField label="Status" name="status" value={form.status}
            onChange={handleChange} error={errors.status}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </InputField>

          <div className="mt-2 flex gap-3">
            <button disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link to={`/employees/${id}`}
              className="rounded-lg bg-gray-100 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-200">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}