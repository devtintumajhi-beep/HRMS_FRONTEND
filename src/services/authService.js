import api from "./api";

export const signup = (data) => api.post("/auth/signup", data);

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  const d = res.data || {};
  if (d.token) localStorage.setItem("token", d.token);

  const name = d.fullName || d.user?.fullName;
  if (name) localStorage.setItem("fullName", name);

  const role = d.role || d.user?.role;
  if (role) localStorage.setItem("role", role);

  const employeeId = d.employeeId || d.user?.employeeId;
  if (employeeId) localStorage.setItem("employeeId", String(employeeId));

  return res;
};

export const forgotPassword = (data) => api.post("/auth/forgot-password", data);