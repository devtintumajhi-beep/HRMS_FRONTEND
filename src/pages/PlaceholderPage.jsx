export default function PlaceholderPage({ title }) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="mt-2 text-gray-500">This module will be available soon.</p>
    </div>
  );
}