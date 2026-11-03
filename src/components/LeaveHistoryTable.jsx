import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "./Alert";
import { getLeaveHistory } from "../services/leaveService";
import {
  LEAVE_STATUS_OPTIONS,
  countDays,
  formatDate,
  statusStyles,
} from "../utils/leaveHelpers";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

/**
 * Props
 *  - employeeId     optional; defaults to the logged-in employee's ID
 *  - refreshKey     change this number to reload the table
 *                   (the form increases it after a successful submit)
 */
export default function LeaveHistoryTable({ employeeId, refreshKey = 0 }) {
  const id = employeeId || localStorage.getItem("employeeId") || "";

  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const loadHistory = useCallback(async () => {
  if (!id) return;
  setLoading(true);
  setError("");
  const result = await callApi(() => getLeaveHistory());
  if (result.ok) {
    const d = result.data;
    const all = Array.isArray(d) ? d : d?.content ?? d?.leaves ?? [];
    // /leaves returns every request: keep only this employee's
    const mine = all.filter((l) => {
      const owner = l.employeeId ?? l.employee?.id;
      return owner === undefined || owner === null || String(owner) === String(id);
    });
    setLeaves(mine);
  } else if (result.status === 401 || result.status === 403) {
    setError("Access denied. Please login again.");
  } else {
    setError(getErrorMessage(result));
  }
  setLoading(false);
}, [id]);

  // Loads on first show, and again whenever refreshKey changes
  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshKey]);

  const rows = useMemo(() => {
    const list = leaves.map((l, i) => {
      const start = l.startDate || l.fromDate;
      const end = l.endDate || l.toDate;
      return {
        key: l.id ?? l.leaveId ?? i,
        type: l.leaveType?.name || l.leaveType || "—",
        start,
        end,
        days: l.days ?? l.totalDays ?? countDays(start, end),
        reason: l.reason || "",
        status: String(l.status || "").toUpperCase(),
        attachment: l.attachmentUrl || l.attachment || "",
        appliedOn: l.appliedOn || l.createdAt || "",
      };
    });
    // Newest first
    list.sort((a, b) => new Date(b.start) - new Date(a.start));
    return statusFilter ? list.filter((r) => r.status === statusFilter) : list;
  }, [leaves, statusFilter]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Leave History</h2>
          <p className="text-sm text-gray-500">Your past and pending leave requests.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LEAVE_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={loadHistory}
            disabled={loading || !id}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      {!id && (
        <Alert type="error" message="Employee ID not found. Please login again." />
      )}

      <Alert type="error" message={error} />
      {error && (
        <button
          onClick={loadHistory}
          className="mb-4 rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          Try again
        </button>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attachment</th>
              <th className="px-4 py-3">Applied On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  Loading leave history...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <p className="text-4xl">🌴</p>
                  <p className="mt-2 font-semibold text-gray-700">No Leave Requests Found</p>
                  <p className="text-sm text-gray-400">
                    {statusFilter
                      ? "No requests with this status."
                      : error
                      ? "We could not load your leave history."
                      : "Leave requests you apply for will appear here."}
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r) => (
                <tr key={r.key} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                    {r.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDate(r.start)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDate(r.end)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.days}</td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    <span className="block truncate" title={r.reason}>
                      {r.reason || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[r.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status
                        ? r.status.charAt(0) + r.status.slice(1).toLowerCase()
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.attachment ? (
                      <a
                        href={r.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDate(r.appliedOn)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && rows.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          Showing {rows.length} of {leaves.length} requests
        </p>
      )}
    </div>
  );
}