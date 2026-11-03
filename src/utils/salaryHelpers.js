// Roles are ASSUMED: confirm the exact names with Naresh.
export const EDIT_ROLES = ["SUPER_ADMIN", "HR_ADMIN", "HR"];
export const VIEW_ROLES = [...EDIT_ROLES, "FINANCE", "FINANCE_ADMIN", "PAYROLL"];

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const isSet = (v) => v !== null && v !== undefined && v !== "";

export const formatMoney = (value, currency = "INR") => {
  if (!isSet(value) || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value));
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

const describeRule = (c) => {
  const kind = String(c.calculationType || c.method || "").toUpperCase();
  if (kind === "PERCENTAGE") {
    return `${c.percentage ?? "?"}% of ${c.baseComponent || c.base || "base"}`;
  }
  if (kind === "FIXED") return "Fixed amount";
  return c.formula || c.description || "—";
};

// ---- Field mapping: change here if Naresh's response names differ ----
export const normalizeBreakdown = (d) => {
  const data = d || {};
  const list = data.components ?? data.items ?? [];

  const components = list.map((c, i) => {
    const type = String(c.type || c.componentType || "").toUpperCase();
    return {
      id: c.componentId ?? c.id ?? i,
      name: c.name || c.componentName || "Component",
      type: type === "DEDUCTION" ? "DEDUCTION" : "EARNING",
      rule: describeRule(c),
      calculated: num(c.calculatedAmount ?? c.amount),
      override: isSet(c.overrideAmount) ? num(c.overrideAmount) : null,
    };
  });

  return {
    employeeName:
      data.employeeName ||
      [data.firstName, data.lastName].filter(Boolean).join(" ") ||
      "",
    employeeCode: data.employeeCode || "",
    designation: data.designation?.name || data.designation || "",
    currency: data.currency || "INR",
    components,
    server: {
      gross: isSet(data.grossEarnings) ? num(data.grossEarnings) : null,
      deductions: isSet(data.totalDeductions) ? num(data.totalDeductions) : null,
      net: isSet(data.netPay) ? num(data.netPay) : null,
    },
  };
};

export const normalizeAuditLog = (d) => {
  const list = Array.isArray(d) ? d : d?.content ?? d?.entries ?? [];
  return list.map((a, i) => ({
    key: a.id ?? i,
    component: a.componentName || a.component || "—",
    oldAmount: a.oldAmount,
    newAmount: a.newAmount,
    reason: a.reason || "",
    changedBy: a.changedBy || a.user || "—",
    changedAt: a.changedAt || a.createdAt || "",
  }));
};

export const effectiveAmount = (c) => (c.override !== null ? c.override : c.calculated);

export const sumAmounts = (components, amountOf) => {
  let earnings = 0;
  let deductions = 0;
  components.forEach((c) => {
    const a = amountOf(c);
    if (c.type === "DEDUCTION") deductions += a;
    else earnings += a;
  });
  return { earnings, deductions, net: earnings - deductions };
};