import { useState } from "react";
import { STATUS_OPTIONS, emptyFilters } from "../utils/attendanceFilters";

// yyyy-mm-dd in the user's local time
const toISO = (d) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500";

function Label({ children }) {
  return <label className="mb-1 block text-xs font-medium text-gray-600">{children}</label>;
}

/**
 * Props
 *  - onApply(filters)   called when the user clicks Apply (or presses Enter)
 *  - onReset()          called when the user clicks Reset (optional)
 *  - departments        array of department names, e.g. ["HR", "IT"] (optional)
 *  - loading            true while the table is loading (disables buttons)
 *  - initialFilters     starting values (optional)
 */
export default function AttendanceFilters({
  onApply,
  onReset,
  departments = [],
  loading = false,
  initialFilters = emptyFilters,
}) {
  const [draft, setDraft] = useState({ ...emptyFilters, ...initialFilters });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setDraft({ ...draft, [e.target.name]: e.target.value });
    setError("");
  };

  const setRange = (from, to) => {
    setDraft({ ...draft, dateFrom: toISO(from), dateTo: toISO(to) });
    setError("");
  };

  const quickToday = () => setRange(new Date(), new Date());

  const quickLast7 = () => {
    const from = new Date();
    from.setDate(from.getDate() - 6);
    setRange(from, new Date());
  };

  const quickThisMonth = () => {
    const now = new Date();
    setRange(new Date(now.getFullYear(), now.getMonth(), 1), now);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
      setError("'From' date cannot be after 'To' date.");
      return;
    }
    setError("");
    onApply({ ...draft, search: draft.search.trim() });
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setError("");
    if (onReset) onReset();
    else onApply(emptyFilters);
  };

  const quickBtn =
    "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200";

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Label>Search</Label>
          <input
            name="search"
            value={draft.search}
            onChange={handleChange}
            placeholder="Employee name or ID"
            className={inputClass}
          />
        </div>

        <div>
          <Label>From</Label>
          <input type="date" name="dateFrom" value={draft.dateFrom}
            onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <Label>To</Label>
          <input type="date" name="dateTo" value={draft.dateTo}
            onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <Label>Status</Label>
          <select name="status" value={draft.status} onChange={handleChange} className={inputClass}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <Label>Department</Label>
          {departments.length > 0 ? (
            <select name="department" value={draft.department}
              onChange={handleChange} className={inputClass}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          ) : (
            <input name="department" value={draft.department} onChange={handleChange}
              placeholder="Department (leave empty for all)" className={inputClass} />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Quick range:</span>
        <button type="button" onClick={quickToday} className={quickBtn}>Today</button>
        <button type="button" onClick={quickLast7} className={quickBtn}>Last 7 days</button>
        <button type="button" onClick={quickThisMonth} className={quickBtn}>This month</button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Loading..." : "Apply Filters"}
        </button>
        <button type="button" onClick={handleReset} disabled={loading}
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-60">
          Reset
        </button>
      </div>
    </form>
  );
}