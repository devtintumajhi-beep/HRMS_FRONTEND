import api from "./api";

// GET http://localhost:8080/api/v1/leaves  (returns all leave requests)
export const getLeaveHistory = () => api.get("/leaves");