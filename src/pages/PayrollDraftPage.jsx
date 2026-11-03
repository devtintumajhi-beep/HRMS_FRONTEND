import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "../components/Alert";
import PayrollDraftTable from "../components/PayrollDraftTable";
import PayrollAuditModal from "../components/PayrollAuditModal";
import {
  AUDIT_LOG_ENABLED,
  adjustPayroll,
  getPayrollDraft,
} from "../services/payrollDraftService";
import {
  ADJUST_ROLES,
  DRAFT_VIEW_ROLES,
  currentMonth,
  formatPeriod,
  isLocked,
  normalizeDraft,
} from "../utils/payrollDraftHelpers";
import { formatMoney } from "../utils/salaryHelpers";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function PayrollDraftPage() {
  const role = localStorage.getItem("role") || "";
  const canView = DRAFT_VIEW_ROLES.includes(role);
  const canEdit = ADJUST_ROLES.includes(role);

  const [month, setMonth] = useState(currentMonth());
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [query, setQuery] = useState("");
  const [historyRow, setHistoryRow] = useState(null);
  const [adjustedIds, setAdjustedIds] = useState(new Set()); // rows saved in this session

  const loadDraft = useCallback(
    async (silent = false) => {
      if (!month) return;
      if (!silent) setLoading(true);
      setError("");
      const result = await callApi(() => getPayrollDraft(month));
      if (result.ok) {
        setDraft(normalizeDraft(result.data, month));
      } else {
        if (!silent) setDraft(null);
        if (result.status === 404) setError(`No payroll has been processed for ${formatPeriod(month)}.`);
        else if (result.status === 401 || result.status === 403)
          setError("Access denied. You are not allowed to view payroll.");
        else setError(getErrorMessage(result));
      }
      if (!silent) setLoading(false);
    },
    [month]
  );

  useEffect(() => {
    if (canView) {
      setAlert({ type: "", message: "" });
      loadDraft();
    }
  }, [canView, loadDraft]);

  const locked = draft ? isLocked(draft.status) : false;

  // Called by the table when "Recalculate" is clicked on an edited row
  const handleAdjust = async (row, body) => {
    setAlert({ type: "", message: "" });
    const result = await callApi(() => adjustPayroll(row.id, body));
    if (result.ok) {
      await loadDraft(true);
      setAdjustedIds((s) => new Set(s).add(row.id));
      setAlert({
        type: "success",
        message: `${row.name}: row recalculated and the change was recorded in the audit log.`,
      });
      return { ok: true };
    }
    if (result.status === 403) {
      return { ok: false, error: "You are not allowed to adjust payroll values." };
    }
    if (result.status === 409) {
      return { ok: false, error: "This payroll is locked. Adjustments are no longer allowed." };
    }
    return { ok: false, error: getErrorMessage(result) };
  };

  const rows = useMemo(
    () =>
      (draft?.rows ?? []).map((r) => ({ ...r, adjusted: r.adjusted || adjustedIds.has(r.id) })),
    [draft, adjustedIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.code, r.name, r.department].join(" ").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (t, r) => ({
          gross: t.gross + r.gross,
          deductions: t.deductions + r.deductions,
          net: t.net + r.net,
        }),
        { gross: 0, deductions: 0, net: 0 }
      ),
    [rows]
  );

  if (!canView) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-4xl">🔒</p>
        <p className="mt-2 font-semibold text-gray-700">You do not have access</p>
        <p className="text-sm text-gray-400">Only Finance and HR can view the payroll draft.</p>
      </div>
    );
  }

  const currency = draft?.currency || "INR";

  return (
    <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll Draft Preview</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatPeriod(month)}
            {draft && (
              <span
                className={`ml-2 rounded-full px-3 py-0.5 text-xs font-semibold ${
                  locked ? "bg-gray-200 text-gray-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {locked ? "Locked" : "Draft"}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID, department..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
          />
          <button
            onClick={() => loadDraft()}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type={alert.type} message={alert.message} />
      {error && (
        <button
          onClick={() => loadDraft()}
          className="mb-4 rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          Try again
        </button>
      )}

      {locked && (
        <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          🔒 This payroll is locked. Adjustments are disabled.
        </div>
      )}

      {!canEdit && draft && (
        <p className="mb-4 text-xs text-gray-400">
          You can view this draft. Only Finance Admins can adjust values.
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-blue-50 p-4 text-sm lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-gray-500">Employees</p>
          <p className="mt-1 text-lg font-semibold text-gray-800">{rows.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Total Gross</p>
          <p className="mt-1 text-lg font-semibold text-gray-800">
            {formatMoney(totals.gross, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Total Deductions</p>
          <p className="mt-1 text-lg font-semibold text-gray-800">
            {formatMoney(totals.deductions, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Total Net Pay</p>
          <p className="mt-1 text-lg font-bold text-blue-700">
            {formatMoney(totals.net, currency)}
          </p>
        </div>
      </div>

      <PayrollDraftTable
        rows={filtered}
        currency={currency}
        canEdit={canEdit}
        locked={locked}
        loading={loading}
        resetKey={`${month}|${query}`}
        showHistory={AUDIT_LOG_ENABLED}
        onAdjust={handleAdjust}
        onHistory={setHistoryRow}
      />

      <PayrollAuditModal
        batchId={null}
        row={historyRow}
        currency={currency}
        onClose={() => setHistoryRow(null)}
      />
    </div>
  );
}