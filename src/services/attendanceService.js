import api from "./api";

// GET  http://localhost:8080/api/v1/attendance/today/{employeeId}
export const getTodayAttendance = (employeeId) =>
  api.get(`/attendance/today/${employeeId}`);

// POST http://localhost:8080/api/v1/attendance/check-in   body: { employeeId }
export const checkIn = (employeeId) =>
  api.post("/attendance/check-in", { employeeId: Number(employeeId) });

// POST http://localhost:8080/api/v1/attendance/check-out  body: { employeeId }
export const checkOut = (employeeId) =>
  api.post("/attendance/check-out", { employeeId: Number(employeeId) });