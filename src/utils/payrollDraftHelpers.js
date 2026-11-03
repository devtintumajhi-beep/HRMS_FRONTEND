// Roles are ASSUMED: confirm the exact names with Naresh.
export const ADJUST_ROLES = ["SUPER_ADMIN", "FINANCE_ADMIN"];
export const DRAFT_VIEW_ROLES = [
  ...ADJUST_ROLES,
  "FINANCE",
  "PAYROLL",
  "HR_ADMIN",
  "HR",
];

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const isSet = (v) => v !== null && v !== undefined && v !== "";

// "2026-10" for the current month
export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// "2026-11" -> "November 2026"
export const formatPeriod = (value) => {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})/.exec(String(value));
  if (!m) return String(value);
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

// ---- Field mapping: change here if Naresh's response names differ ----
const fullName = (r) =>
  r.employeeName ||
  r.fullName ||
  [r.firstName, r.lastName].filter(Boolean).join(" ") ||
  [r.employee?.firstName, r.employee?.lastName].filter(Boolean).join(" ") ||
  r.employee?.name ||
  "";

export const normalizeRecord = (r, i) => {
  const gross = num(r.grossSalary ?? r.gross ?? r.grossPay);
  const deductions = num(r.totalDeductions ?? r.deductions);
  const netRaw = r.netSalary ?? r.netPay ?? r.net;
  const employeeId = r.employeeId ?? r.employee?.id ?? null;
  const items = r.items ?? r.components ?? [];

  return {
    id: r.id ?? r.payrollId ?? i, // payroll record id, used by /payroll/{id}/adjust
    employeeId,
    code: r.employeeCode || r.employee?.employeeCode || "",
    name: fullName(r) || `Employee ${employeeId ?? i}`,
    department: r.department?.name || r.department || r.employee?.department?.name || "—",
    gross,
    deductions,
    lop: num(r.lopDeduction ?? r.lop),
    net: isSet(netRaw) ? num(netRaw) : gross - deductions,
    adjusted: Boolean(r.adjusted ?? r.manuallyAdjusted),
    items: items.map((it, k) => {
      const type = String(it.type || it.componentType || "").toUpperCase();
      return {
        key: it.id ?? it.componentId ?? k,
        name: it.name || it.componentName || it.component || "Component",
        type: type === "DEDUCTION" ? "DEDUCTION" : "EARNING",
        amount: num(it.amount ?? it.value ?? it.calculatedAmount),
      };
    }),
  };
};

export const normalizeDraft = (d, month) => {
  const data = d || {};
  const list = Array.isArray(data)
    ? data
    : data.rows ?? data.entries ?? data.employees ?? data.payrolls ?? data.content ?? [];
  return {
    period: data.month || data.period || month,
    status: String(data.status || "DRAFT").toUpperCase(),
    processedAt: data.processedAt || "",
    currency: data.currency || "INR",
    rows: list.map(normalizeRecord),
  };
};

export const isLocked = (status) => status === "LOCKED";

export const normalizeEntryAudit = (d) => {
  const list = Array.isArray(d) ? d : d?.content ?? d?.entries ?? [];
  return list.map((a, i) => ({
    key: a.id ?? i,
    action: String(a.action || "ADJUSTED").toUpperCase(),
    oldGross: a.oldGross,
    newGross: a.newGross,
    oldDeductions: a.oldDeductions,
    newDeductions: a.newDeductions,
    oldNet: a.oldNet ?? a.oldNetPay,
    newNet: a.newNet ?? a.newNetPay,
    reason: a.reason || "",
    changedBy: a.changedBy || a.user || "—",
    changedAt: a.changedAt || a.createdAt || "",
  }));
};