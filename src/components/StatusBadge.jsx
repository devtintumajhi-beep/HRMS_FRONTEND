const styles = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-200 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  VERIFIED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REQUEST_REUPLOAD: "bg-orange-100 text-orange-700",
  NOT_UPLOADED: "bg-gray-100 text-gray-600",
};

const labels = {
  PENDING: "Pending verification",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  REQUEST_REUPLOAD: "Re-upload requested",
  NOT_UPLOADED: "Not uploaded",
};

export default function StatusBadge({ status, label }) {
  const key = String(status || "").toUpperCase();
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        styles[key] || "bg-gray-100 text-gray-700"
      }`}
    >
      {label || labels[key] || status || "—"}
    </span>
  );
}