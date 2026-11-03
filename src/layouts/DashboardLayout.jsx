import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import menuItems from "../config/menuItems";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  const userName = localStorage.getItem("fullName") || "User";

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("fullName");
  localStorage.removeItem("role");
  localStorage.removeItem("employeeId");
  navigate("/login");
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-200 transition-all duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex h-16 items-center justify-between px-5 text-white">
          <span className={`text-xl font-bold ${collapsed ? "lg:hidden" : ""}`}>HRMS</span>
          <button onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded p-1 hover:bg-slate-800 lg:block" title="Collapse sidebar">
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className={`transition-all duration-200 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white px-4 shadow-sm sm:px-6">
          <button onClick={() => setMobileOpen(true)}
            className="rounded p-2 text-xl hover:bg-gray-100 lg:hidden">
            ☰
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{userName}</span>
            <button onClick={handleLogout}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
              Logout
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}