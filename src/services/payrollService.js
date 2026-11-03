import api from "./api";

// ASSUMED endpoints: confirm with Naresh and change only here.

// GET http://localhost:8080/api/v1/payroll/employees/{id}/salary-breakdown
export const getSalaryBreakdown = (id) =>
  api.get(`/payroll/employees/${id}/salary-breakdown`);

// PUT http://localhost:8080/api/v1/payroll/employees/{id}/salary-overrides
// body: { reason: "...", overrides: [{ componentId, amount }] }   amount null = remove override
export const updateSalaryOverrides = (id, body) =>
  api.put(`/payroll/employees/${id}/salary-overrides`, body);

// GET http://localhost:8080/api/v1/payroll/employees/{id}/salary-audit-log
export const getSalaryAuditLog = (id) =>
  api.get(`/payroll/employees/${id}/salary-audit-log`);