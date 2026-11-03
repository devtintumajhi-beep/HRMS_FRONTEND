export const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "ABSENT", label: "Absent" },
];

export const emptyFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
  department: "",
  status: "",
};

// Turns the filters into query parameters for the API call.
// ASSUMED names (from, to, department, status, search): confirm with Naresh
// and change only here. Empty filters are left out.
export function buildAttendanceParams(filters) {
  const params = {};
  if (filters.dateFrom) params.startDate = filters.dateFrom;
  if (filters.dateTo) params.endDate = filters.dateTo;
  if (filters.department) params.department = filters.department;
  if (filters.status) params.status = filters.status;
  return params;
}