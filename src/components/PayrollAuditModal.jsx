import { useEffect, useState } from "react";
import { getEntryAuditLog } from "../services/payrollDraftService";
import { normalizeEntryAudit } from "../utils/payrollDraftHelpers";
import { formatDateTime, formatMoney } from "../utils/salaryHelpers";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

const isSet = (v) => v !== null && v !== undefined && v !== "";

export default function PayrollAuditModal({ batchId, row, currency, onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rowId = row?.id;

  useEffect(() => {
    if (rowId === undefined) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      const res = await callApi(() => getEntryAuditLog(batchId, rowId));
      if (cancelled) return;
      if (res.ok) setEntries(normalizeEntryAudit(res.data));
      else {
        setEntries([]);
        setError(getErrorMessage(res));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [batchId, rowId]);

  if (!row) return null;

  // "₹10,000.00 → ₹12,000.00"
  const change = (oldV, newV) =>
    isSet(oldV) || isSet(newV)
      ? `${formatMoney(oldV, currency)} → ${formatMoney(newV, currency)}`
      : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Audit Log</h2>
            <p className="text-sm text-gray-500">
              {row.name}
              {row.code && ` · ${row.code}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
          >
            Close
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Gross</th>
                <th className="px-4 py-3">Deductions</th>
                <th className="px-4 py-3">Net Pay</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Loading audit log...
                  </td>
                </tr>
              )}
              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No changes recorded for this employee.
                  </td>
                </tr>
              )}
              {!loading &&
                entries.map((a) => (
                  <tr key={a.key}>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {formatDateTime(a.changedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          a.action === "RECALCULATED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {a.action.charAt(0) + a.action.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {change(a.oldGross, a.newGross)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {change(a.oldDeductions, a.newDeductions)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                      {change(a.oldNet, a.newNet)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.reason || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.changedBy}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}