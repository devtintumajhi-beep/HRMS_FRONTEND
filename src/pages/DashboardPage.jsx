import { Link } from "react-router-dom";
import menuItems from "../config/menuItems";
import AttendanceWidget from "../components/AttendanceWidget";

export default function DashboardPage() {
  const userName = localStorage.getItem("fullName") || "User";
  const modules = menuItems.filter((m) => m.path !== "/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Welcome, {userName} 👋</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Clock in for the day or choose a module to get started.
      </p>

      <AttendanceWidget />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((m) => (
          <Link
            key={m.path}
            to={m.path}
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-3xl">{m.icon}</div>
            <p className="mt-3 font-semibold text-gray-800">{m.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}