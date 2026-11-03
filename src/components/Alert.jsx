export default function Alert({ type = "error", message }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "border-green-300 bg-green-50 text-green-800"
      : "border-red-300 bg-red-50 text-red-800";

  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles}`} role="alert">
      {message}
    </div>
  );
}