import api from "./api";

// POST http://localhost:8080/api/v1/organizations
export const createOrganization = (data) => api.post("/organizations", data);

// GET http://localhost:8080/api/v1/organizations/{id}
export const getOrganization = (id) => api.get(`/organizations/${id}`);

// ASSUMED: confirm with Naresh/Julius and change only here.
// POST /api/v1/files/upload   multipart: file, folder   ->  returns { url }
export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "company-logos");
  return api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};