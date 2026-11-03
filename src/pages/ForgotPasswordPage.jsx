import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import InputField from "../components/InputField";
import Alert from "../components/Alert";
import { forgotPassword } from "../services/authService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");

    setLoading(true);
    const result = await callApi(() => forgotPassword({ email: email.trim() }));
    setLoading(false);

    if (result.ok) {
      setAlert({
        type: "success",
        message: "Password reset link has been sent. Please check your email.",
      });
      setEmail("");
    } else {
      setAlert({ type: "error", message: getErrorMessage(result) });
    }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link">
      <Alert type={alert.type} message={alert.message} />

      <form onSubmit={handleSubmit} noValidate>
        <InputField label="Email" name="email" type="email" placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)} error={error} />

        <button disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          ← Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}