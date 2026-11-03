import { useEffect, useState } from "react";
import { SEND_REASON } from "../services/payrollDraftService";
import { formatMoney } from "../utils/salaryHelpers";

const PAGE_SIZE = 10;
const MIN_REASON = 5;

export default function PayrollDraftTable({
  rows,
  currency,
  canEdit, // Finance Admin role
  locked, // draft is locked
  loading,
  resetKey, // changes when the search text or month changes
  showHistory, // true when the audit log endpoint is available
  onAdjust, // async (row, { grossSalary, totalDeductions, reason }) => { ok, error }
  onHistory, // (row) => void
}) {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ gross: "", deductions: "", reason: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPage(1);
    setEditingId(null);
  }, [resetKey]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const startEdit = (row) => {
    setEditingId(row.id);
    setDraft({ gross: String(row.gross), deductions: String(row.deductions), reason: "" });
    setFormError("");
  };

  const cancelEdit = () => {
    if (saving) return;
    setEditingId(null);
    setFormError("");
  };

  const handleChange = (e) => {
    setDraft({ ...draft, [e.target.name]: e.target.value });
    setFormError("");
  };

  const previewNet = () => {
    const g = parseFloat(draft.gross);
    const d = parseFloat(draft.deductions);
    return Number.isFinite(g) && Number.isFinite(d) ? g - d : null;
  };

  const handleSave = async (row) => {
    const g = parseFloat(draft.gross);
    const d = parseFloat(draft.deductions);

    if (!Number.isFinite(g) || !Number.isFinite(d) || g < 0 || d < 0) {
      setFormError("Enter valid amounts (0 or more) for Gross and Deductions.");
      return;
    }
    if (d > g) {
      setFormError("Deductions cannot be more than Gross.");
      return;
    }
    if (g === row.gross && d === row.deductions) {
      setFormError("You have not changed any amount.");
      return;
    }
    if (SEND_REASON && draft.reason.trim().length < MIN_REASON) {
      setFormError(`Please enter a reason (at least ${MIN_REASON} characters).`);
      return;
    }

    setSaving(true);
    const result = await onAdjust(row, {
      grossSalary: g,
      totalDeductions: d,
      reason: draft.reason.trim(),
    });
    setSaving(false);

    if (result.ok) {
      setEditingId(null);
      setFormError("");
    } else {
      setFormError(result.error || "Could not save the adjustment.");
    }
  };

  const inputClass =
    "w-28 rounded-lg border border-gray-300 px-2 py-1.5 text-right text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Employee ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3 text-right">Gross</th>
              <th className="px-4 py-3 text-right">Deductions</th>
              <th className="px-4 py-3 text-right">LOP</th>
              <th className="px-4 py-3 text-right">Net Pay</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  Loading payroll draft...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <p className="text-4xl">🧾</p>
                  <p className="mt-2 font-semibold text-gray-700">No Employees Found</p>
                  <p className="text-sm text-gray-400">
                    Employees processed for this month will appear here.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              visible.map((r) => {
                const editing = editingId === r.id;
                const net = previewNet();

                return [
                  <tr key={r.id} className={editing ? "bg-blue-50" : "hover:bg-gray-50"}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-700">
                      {r.code || r.employeeId || r.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.department}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {editing ? (
                        <input type="number" min="0" step="0.01" name="gross"
                          value={draft.gross} onChange={handleChange} className={inputClass} />
                      ) : (
                        formatMoney(r.gross, currency)
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {editing ? (
                        <input type="number" min="0" step="0.01" name="deductions"
                          value={draft.deductions} onChange={handleChange} className={inputClass} />
                      ) : (
                        formatMoney(r.deductions, currency)
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600">
                      {formatMoney(r.lop, currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                      {formatMoney(editing && net !== null ? net : r.net, currency)}
                    </td>

                    <td className="px-4 py-3">
                      {r.adjusted && (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Adjusted
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {canEdit && !locked && !editing && (
                        <button
                          onClick={() => startEdit(r)}
                          disabled={editingId !== null}
                          className="mr-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          Edit
                        </button>
                      )}
                      {showHistory && (
                        <button
                          onClick={() => onHistory(r)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                          History
                        </button>
                      )}
                    </td>
                  </tr>,

                  editing && (
                    <tr key={`${r.id}-edit`} className="bg-blue-50">
                      <td colSpan={9} className="px-4 pb-4">
                        {SEND_REASON && (
                          <>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Reason for adjustment <span className="text-red-600">*</span>
                            </label>
                            <textarea
                              rows={2}
                              name="reason"
                              value={draft.reason}
                              onChange={handleChange}
                              placeholder="Example: Added approved bonus"
                              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Net Pay is recalculated by the server, and the change is recorded in the
                          audit log.
                        </p>
                        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
                        <div className="mt-3 flex gap-3">
                          <button
                            onClick={() => handleSave(r)}
                            disabled={saving}
                            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {saving ? "Recalculating..." : "Recalculate"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
          </tbody>
        </table>
      </div>

      {!loading && rows.length > 0 && (
        <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
          <span>
            Showing {(current - 1) * PAGE_SIZE + 1}–
            {Math.min(current * PAGE_SIZE, rows.length)} of {rows.length} employees
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(current - 1)}
              disabled={current === 1}
              className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              ← Prev
            </button>
            <span>
              Page {current} of {pageCount}
            </span>
            <button
              onClick={() => setPage(current + 1)}
              disabled={current === pageCount}
              className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}