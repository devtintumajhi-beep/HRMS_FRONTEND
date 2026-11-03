import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/Alert";
import SalarySection from "../components/SalarySection";
import SalaryAuditLog from "../components/SalaryAuditLog";
import {
  getSalaryAuditLog,
  getSalaryBreakdown,
  updateSalaryOverrides,
} from "../services/payrollService";
import {
  EDIT_ROLES,
  VIEW_ROLES,
  effectiveAmount,
  formatMoney,
  normalizeAuditLog,
  normalizeBreakdown,
  sumAmounts,
} from "../utils/salaryHelpers";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

const MIN_REASON = 5;

export default function EmployeeSalaryPage() {
  const { id } = useParams();
  const role = localStorage.getItem("role") || "";
  const canView = VIEW_ROLES.includes(role);
  const canEdit = EDIT_ROLES.includes(role);

  const [data, setData] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [error, setError] = useState("");
  const [auditError, setAuditError] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [resets, setResets] = useState(new Set());
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setAuditLoading(true);
    setError("");
    setAuditError("");

    const [b, a] = await Promise.all([
      callApi(() => getSalaryBreakdown(id)),
      callApi(() => getSalaryAuditLog(id)),
    ]);

    if (b.ok) setData(normalizeBreakdown(b.data));
    else {
      setData(null);
      if (b.status === 404) setError("Salary details not found for this employee.");
      else if (b.status === 401 || b.status === 403)
        setError("Access denied. Only HR and Finance can view salary details.");
      else setError(getErrorMessage(b));
    }
    setLoading(false);

    if (a.ok) setAudit(normalizeAuditLog(a.data));
    else {
      setAudit([]);
      setAuditError(getErrorMessage(a));
    }
    setAuditLoading(false);
  }, [id]);

  useEffect(() => {
    if (canView) loadAll();
  }, [canView, loadAll]);

  // ---------- Edit mode ----------
  const startEdit = () => {
    const initial = {};
    data.components.forEach((c) => (initial[c.id] = String(effectiveAmount(c))));
    setDrafts(initial);
    setResets(new Set());
    setReason("");
    setAlert({ type: "", message: "" });
    setEditing(true);
  };

  const cancelEdit = () => {
    if (saving) return;
    setEditing(false);
    setAlert({ type: "", message: "" });
  };

  const handleDraft = (cid, value) => {
    setDrafts((d) => ({ ...d, [cid]: value }));
    setResets((r) => {
      const next = new Set(r);
      next.delete(cid);
      return next;
    });
  };

  const handleReset = (c) => {
    const next = new Set(resets);
    if (next.has(c.id)) {
      next.delete(c.id);
      setDrafts((d) => ({ ...d, [c.id]: String(effectiveAmount(c)) }));
    } else {
      next.add(c.id);
      setDrafts((d) => ({ ...d, [c.id]: String(c.calculated) }));
    }
    setResets(next);
  };

  const liveAmount = useCallback(
    (c) => {
      if (resets.has(c.id)) return c.calculated;
      const n = parseFloat(drafts[c.id]);
      return Number.isFinite(n) ? n : effectiveAmount(c);
    },
    [drafts, resets]
  );

  const changes = useMemo(() => {
    if (!editing || !data) return [];
    const list = [];
    data.components.forEach((c) => {
      if (resets.has(c.id)) {
        list.push({ componentId: c.id, amount: null });
        return;
      }
      const n = parseFloat(drafts[c.id]);
      if (Number.isFinite(n) && n !== effectiveAmount(c)) {
        list.push({ componentId: c.id, amount: n });
      }
    });
    return list;
  }, [editing, data, drafts, resets]);

  const handleSave = async () => {
    setAlert({ type: "", message: "" });

    const invalid = data.components.some((c) => {
      if (resets.has(c.id)) return false;
      const n = parseFloat(drafts[c.id]);
      return !Number.isFinite(n) || n < 0;
    });
    if (invalid) {
      setAlert({ type: "error", message: "Enter valid amounts (0 or more) for every component." });
      return;
    }
    if (changes.length === 0) {
      setAlert({ type: "error", message: "You have not changed any amount." });
      return;
    }
    if (reason.trim().length < MIN_REASON) {
      setAlert({
        type: "error",
        message: `Please enter a reason (at least ${MIN_REASON} characters). It is saved in the audit log.`,
      });
      return;
    }

    setSaving(true);
    const result = await callApi(() =>
      updateSalaryOverrides(id, { reason: reason.trim(), overrides: changes })
    );
    setSaving(false);

    if (result.ok) {
      setEditing(false);
      await loadAll();
      setAlert({ type: "success", message: "Salary updated and recorded in the audit log." });
    } else if (result.status === 401 || result.status === 403) {
      setAlert({ type: "error", message: "You are not allowed to edit salary amounts." });
    } else {
      setAlert({ type: "error", message: getErrorMessage(result) });
    }
  };

  // ---------- Totals ----------
  const currency = data?.currency || "INR";
  const earnings = data?.components.filter((c) => c.type === "EARNING") ?? [];
  const deductions = data?.components.filter((c) => c.type === "DEDUCTION") ?? [];

  const totals = useMemo(() => {
    if (!data) return { earnings: 0, deductions: 0, net: 0 };
    const computed = sumAmounts(data.components, editing ? liveAmount : effectiveAmount);
    if (editing) return computed;
    // Not editing: prefer the totals calculated by the backend, if it sends them
    return {
      earnings: data.server.gross ?? computed.earnings,
      deductions: data.server.deductions ?? computed.deductions,
      net: data.server.net ?? computed.net,
    };
  }, [data, editing, liveAmount]);

  if (!canView) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-4xl">🔒</p>
        <p className="mt-2 font-semibold text-gray-700">You do not have access</p>
        <p className="text-sm text-gray-400">Only HR and Finance can view salary details.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <Link to={`/employees/${id}`} className="text-sm text-blue-600 hover:underline">
        ← Back to Employee
      </Link>

      <div className="mb-5 mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Salary Breakdown</h1>
          {data && (
            <p className="mt-1 text-sm text-gray-500">
              {data.employeeName || `Employee ${id}`}
              {data.employeeCode && ` · ${data.employeeCode}`}
              {data.designation && ` · ${data.designation}`}
            </p>
          )}
        </div>

        {data && canEdit && !editing && (
          <button
            onClick={startEdit}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      <Alert type="error" message={error} />
      <Alert type={alert.type} message={alert.message} />
      {error && (
        <button
          onClick={loadAll}
          className="mb-4 rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          Try again
        </button>
      )}

      {loading && <p className="text-gray-400">Loading salary details...</p>}

      {!loading && data && data.components.length === 0 && (
        <div className="rounded-xl bg-gray-50 p-8 text-center">
          <p className="text-4xl">💼</p>
          <p className="mt-2 font-semibold text-gray-700">No salary components found</p>
          <p className="text-sm text-gray-400">
            No components are assigned to this employee's designation.
          </p>
        </div>
      )}

      {data && data.components.length > 0 && (
        <>
          <SalarySection
            title="Earnings"
            headerColor="text-green-700"
            rows={earnings}
            currency={currency}
            editing={editing}
            drafts={drafts}
            resets={resets}
            onDraft={handleDraft}
            onReset={handleReset}
            total={totals.earnings}
          />

          <SalarySection
            title="Deductions"
            headerColor="text-red-700"
            rows={deductions}
            currency={currency}
            editing={editing}
            drafts={drafts}
            resets={resets}
            onDraft={handleDraft}
            onReset={handleReset}
            total={totals.deductions}
          />

          {/* Net pay */}
          <div className="rounded-xl bg-blue-50 p-5">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-gray-500">Gross Earnings</p>
                <p className="mt-1 text-lg font-semibold text-gray-800">
                  {formatMoney(totals.earnings, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Total Deductions</p>
                <p className="mt-1 text-lg font-semibold text-gray-800">
                  {formatMoney(totals.deductions, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Net Pay{editing ? " (preview)" : ""}
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {formatMoney(totals.net, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Edit controls */}
          {editing && (
            <div className="mt-6 rounded-xl border border-gray-200 p-5">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Reason for change <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Example: Approved special allowance by management"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                {changes.length} change{changes.length === 1 ? "" : "s"} will be saved. The reason,
                your name and the time are recorded in the audit log.
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <SalaryAuditLog
        entries={audit}
        loading={auditLoading}
        error={auditError}
        currency={currency}
      />
    </div>
  );
}