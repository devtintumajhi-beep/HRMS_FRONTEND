import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import { getEmployeeById } from "../services/employeeService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-400">{label}</p>
      <div className="mt-1 text-sm text-gray-800">{children || "—"}</div>
    </div>
  );
}

export default function EmployeeViewPage() {
  const { id } = useParams();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => getEmployeeById(id));
      if (result.ok) setEmp(result.data);
      else if (result.status === 404) setError("Employee not found.");
      else setError(getErrorMessage(result));
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <Link to="/employees" className="text-sm text-blue-600 hover:underline">
        ← Back to Employees
      </Link>

      <h1 className="mb-6 mt-3 text-2xl font-bold text-gray-800">Employee Profile</h1>

      <Alert type="error" message={error} />
      {loading && <p className="text-gray-400">Loading...</p>}

      {emp && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Employee ID">{emp.employeeCode}</Field>
            <Field label="Status">
              <StatusBadge status={emp.status} />
            </Field>
            <Field label="Name">{`${emp.firstName || ""} ${emp.lastName || ""}`.trim()}</Field>
            <Field label="Email">{emp.email}</Field>
            <Field label="Phone">{emp.phone}</Field>
            <Field label="Organization">{emp.organization?.name}</Field>
            <Field label="Resume">
              {emp.resumeS3Url && (
                <a
                  href={emp.resumeS3Url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open resume
                </a>
              )}
            </Field>
          </div>

          <div className="mt-8 flex gap-3">
  <Link
    to={`/employees/${emp.id}/edit`}
    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
  >
    Edit
  </Link>
  <Link
    to={`/employees/${emp.id}/documents`}
    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
  >
    Onboarding Documents
  </Link>

  <Link
  to={`/employees/${emp.id}/salary`}
  className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
>
  Salary
</Link>
</div>
        </>
      )}
    </div>
  );
}