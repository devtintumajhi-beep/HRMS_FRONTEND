import api from "./api";

// GET http://localhost:8080/api/v1/onboarding/employees/{id}/documents
export const getEmployeeDocuments = (employeeId) =>
  api.get(`/onboarding/employees/${employeeId}/documents`);

// PUT http://localhost:8080/api/v1/onboarding/documents/{documentId}/verify
// body: { status: "VERIFIED" | "REJECTED" | "REQUEST_REUPLOAD", rejectionReason: "" }
export const verifyDocument = (documentId, body) =>
  api.put(`/onboarding/documents/${documentId}/verify`, body);

// ASSUMED (no upload API was given yet): confirm with Naresh and change only here.
// POST /onboarding/employees/{id}/documents   multipart: file, documentType
export const uploadEmployeeDocument = (employeeId, file, documentType) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  return api.post(`/onboarding/employees/${employeeId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};