export default function InputField({
  label, name, type = "text", value, onChange, placeholder, error, children,
}) {
  const base =
    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ";
  const border = error ? "border-red-500" : "border-gray-300";

  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children ? (
        <select id={name} name={name} value={value} onChange={onChange} className={base + border}>
          {children}
        </select>
      ) : (
        <input
          id={name} name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder}
          className={base + border}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}