import api from "./api";

// ASSUMED: confirm these URLs with Naresh and change only here
// GET  /api/v1/recruitment/candidates
export const getCandidates = () => api.get("/recruitment/candidates");

// GET  /api/v1/recruitment/candidates/{id}
export const getCandidateById = (id) => api.get(`/recruitment/candidates/${id}`);

// POST /api/v1/recruitment/candidates/{id}/convert
export const convertCandidateToEmployee = (id) =>
  api.post(`/recruitment/candidates/${id}/convert`);