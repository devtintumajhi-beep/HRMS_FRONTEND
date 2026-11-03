export function getErrorMessage(result) {
  if (!result.status) {
    return "Cannot connect to the server. Please check that the backend is running.";
  }
  const d = result.data;
  if (typeof d === "string" && d) return d;
  return d?.message || d?.error || `Something went wrong (status ${result.status}).`;
}