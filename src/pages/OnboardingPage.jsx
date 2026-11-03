import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [id, setId] = useState(localStorage.getItem("employeeId") || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d+$/.test(id.trim())) {
      setError("Enter a valid numeric employee ID (for example 1)");
      return;
    }
    navigate(`/employees/${id.trim()}/documents`);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">Onboarding</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Enter an employee ID to view the onboarding documents and their verification status.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <InputField label="Employee ID" name="employeeId" placeholder="1"
          value={id} onChange={(e) => setId(e.target.value)} error={error} />
        <button className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700">
          Open Checklist
        </button>
      </form>
    </div>
  );
}