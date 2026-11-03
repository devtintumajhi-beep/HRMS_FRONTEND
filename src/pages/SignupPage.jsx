import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import InputField from "../components/InputField";
import Alert from "../components/Alert";
import { signup } from "../services/authService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

// Edit this list to match the role names your backend accepts
const ROLES = ["SUPER_ADMIN", "HR_ADMIN", "EMPLOYEE"];

const emptyForm = {
  fullName: "",
  email: "",
  companyName: "",
  role: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.role) e.role = "Please select a role";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    if (!validate()) return;

    setLoading(true);
    const result = await callApi(() =>
      signup({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        companyName: form.companyName.trim(),
        role: form.role,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
    );
    setLoading(false);

    if (result.ok) {
      setAlert({
        type: "success",
        message: "Account created successfully! Redirecting to login...",
      });
      setForm(emptyForm);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setAlert({ type: "error", message: getErrorMessage(result) });
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Sign up to get started with HRMS">
      <Alert type={alert.type} message={alert.message} />

      <form onSubmit={handleSubmit} noValidate>
        <InputField label="Full Name" name="fullName" placeholder="Your full name"
          value={form.fullName} onChange={handleChange} error={errors.fullName} />

        <InputField label="Email" name="email" type="email" placeholder="you@company.com"
          value={form.email} onChange={handleChange} error={errors.email} />

        <InputField label="Company Name" name="companyName" placeholder="Your company name"
          value={form.companyName} onChange={handleChange} error={errors.companyName} />

        <InputField label="Role" name="role" value={form.role}
          onChange={handleChange} error={errors.role}>
          <option value="">Select role</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </InputField>

        <InputField label="Password" name="password" type="password" placeholder="Min 8 characters"
          value={form.password} onChange={handleChange} error={errors.password} />

        <InputField label="Confirm Password" name="confirmPassword" type="password"
          placeholder="Re-enter password"
          value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

        <button disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">Login</Link>
      </p>
    </AuthLayout>
  );
}