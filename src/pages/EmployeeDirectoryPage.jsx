import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import { getEmployees } from "../services/employeeService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

// The API does not send department/designation yet, so show "—" until it does.
const text = (v) => (typeof v === "object" && v !== null ? v.name : v) || "—";

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await callApi(() => getEmployees());
    if (result.ok) {
      const d = result.data;
      setEmployees(Array.isArray(d) ? d : d?.content ?? []);
    } else if (result.status === 401 || result.status === 403) {
      setError("Access denied. Please login again.");
    } else {
      setError(getErrorMessage(result));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const rows = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        code: e.employeeCode || "—",
        name: `${e.firstName || ""} ${e.lastName || ""}`.trim() || "—",
        email: e.email || "",
        department: text(e.department),
        designation: text(e.designation),
        status: e.status || "—",
      })),
    [employees]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.code, r.name, r.email, r.department, r.designation, r.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Directory</h1>
          <p className="text-sm text-gray-500">View and manage all employees.</p>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ID, name, department, status..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 sm:w-80"
        />
      </div>

      <Alert type="error" message={error} />
      {error && (
        <button
          onClick={loadEmployees}
          className="mb-4 rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          Try again
        </button>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Employee ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  Loading employees...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <p className="text-4xl">📭</p>
                  <p className="mt-2 font-semibold text-gray-700">No Employees Found</p>
                  <p className="text-sm text-gray-400">
                    {query
                      ? "Try a different search word."
                      : error
                      ? "We could not load the list."
                      : "Employees you add will appear here."}
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-700">
                    {r.code}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.department}</td>
                  <td className="px-4 py-3 text-gray-600">{r.designation}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`/employees/${r.id}`}
                      className="mr-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      View
                    </Link>
                    <Link
                      to={`/employees/${r.id}/edit`}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Edit
                    </Link>
                    <Link
  to={`/employees/${r.id}/documents`}
  className="ml-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
>
  Docs
</Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          Showing {filtered.length} of {rows.length} employees
        </p>
      )}
    </div>
  );
}