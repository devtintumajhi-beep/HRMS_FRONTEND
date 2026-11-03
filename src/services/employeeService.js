import api from "./api";

// GET http://localhost:8080/api/v1/employees
export const getEmployees = () => api.get("/employees");

// GET http://localhost:8080/api/v1/employees/{id}
export const getEmployeeById = (id) => api.get(`/employees/${id}`);

// PUT http://localhost:8080/api/v1/employees/{id}
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);