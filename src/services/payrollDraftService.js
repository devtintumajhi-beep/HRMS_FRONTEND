import api from "./api";

// ---- Switches: flip to true when Naresh adds these ----
// His PUT /payroll/{id}/adjust has no "reason" field yet.
export const SEND_REASON = false;
// He writes audit entries but has not given an endpoint to read them yet.
export const AUDIT_LOG_ENABLED = false;

// GET http://localhost:8080/api/v1/payroll/draft/2026-10
export const getPayrollDraft = (month) => api.get(`/payroll/draft/${month}`);

// PUT http://localhost:8080/api/v1/payroll/{id}/adjust
// Server recalculates Net Salary and writes the audit log entry.
export const adjustPayroll = (payrollId, { grossSalary, totalDeductions, reason }) => {
  const body = { grossSalary, totalDeductions };
  if (SEND_REASON && reason) body.reason = reason;
  return api.put(`/payroll/${payrollId}/adjust`, body);
};

// ASSUMED (not provided yet): GET /payroll/{id}/audit-log. Used only if AUDIT_LOG_ENABLED.
// The first argument is unused (the history modal still passes a batch id).
export const getEntryAuditLog = (_unused, payrollId) =>
  api.get(`/payroll/${payrollId}/audit-log`);