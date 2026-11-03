import { useState } from "react";
import AttendanceFilters from "../components/AttendanceFilters";
import { buildAttendanceParams } from "../utils/attendanceFilters";

export default function FilterTestPage() {
  const [applied, setApplied] = useState(null);

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold">Filter test (temporary)</h1>
      <AttendanceFilters
        departments={["HR", "IT", "Finance"]}
        onApply={setApplied}
        onReset={() => setApplied(null)}
      />
      <p className="mt-4 text-sm font-semibold">Query params that would be sent:</p>
      <pre className="mt-1 rounded bg-gray-50 p-3 text-xs">
        {applied ? JSON.stringify(buildAttendanceParams(applied), null, 2) : "No filters applied"}
      </pre>
    </div>
  );
}