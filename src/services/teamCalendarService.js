import api from "./api";

// GET http://localhost:8080/api/v1/attendance/history?startDate=...&endDate=...
export const getTeamAttendance = (from, to) =>
  api.get("/attendance/history", { params: { startDate: from, endDate: to } });

// GET http://localhost:8080/api/v1/leaves?status=APPROVED
// (the calendar clips each leave to the month on screen)
export const getTeamLeaves = () =>
  api.get("/leaves", { params: { status: "APPROVED" } });