import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import InputField from "../components/InputField";
import Alert from "../components/Alert";
import { login } from "../services/authService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    if (!validate()) return;

    setLoading(true);
    const result = await callApi(() =>
      login({ email: form.email.trim(), password: form.password })
    );
    setLoading(false);

    if (result.ok) {
      navigate("/dashboard");
    } else if (result.status === 401) {
      setAlert({ type: "error", message: "Invalid email or password." });
    } else {
      setAlert({ type: "error", message: getErrorMessage(result) });
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Login to your HRMS account">
      <Alert type={alert.type} message={alert.message} />

      <form onSubmit={handleSubmit} noValidate>
        <InputField label="Email" name="email" type="email" placeholder="you@company.com"
          value={form.email} onChange={handleChange} error={errors.email} />
        <InputField label="Password" name="password" type="password" placeholder="••••••••"
          value={form.password} onChange={handleChange} error={errors.password} />

        <div className="mb-4 text-right">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium text-blue-600 hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}