export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel (hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 to-indigo-800 p-12 text-white lg:flex">
        <h2 className="text-2xl font-bold tracking-wide">HRMS</h2>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Human Resource <br /> Management System
          </h1>
          <p className="mt-4 max-w-sm text-blue-100">
            Manage employees, attendance, payroll and more from one place.
          </p>
        </div>
        <p className="text-sm text-blue-200">© {new Date().getFullYear()} HRMS</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-gray-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}