export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n) => String(n).padStart(2, "0");
export const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Parse "yyyy-mm-dd" as a LOCAL date (avoids timezone shifts)
const parseISO = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};
const dateKey = (date) =>
  toISO(date.getFullYear(), date.getMonth(), date.getDate());

export const getMonthRange = (year, month) => {
  const last = new Date(year, month + 1, 0).getDate();
  return { from: toISO(year, month, 1), to: toISO(year, month, last) };
};

// Flat list for the grid: blanks before day 1, then one object per day
export const buildMonthGrid = (year, month) => {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      key: toISO(year, month, d),
      weekday: new Date(year, month, d).getDay(),
    });
  }
  return cells;
};

// ---- Field mapping: change here if Naresh's response names differ ----
const personId = (r) => r.employeeId ?? r.employee?.id ?? r.id ?? null;

const personName = (r) =>
  r.employeeName ||
  r.fullName ||
  [r.firstName, r.lastName].filter(Boolean).join(" ") ||
  r.employee?.name ||
  (personId(r) != null ? `Employee ${personId(r)}` : "Unknown");

const asList = (d) => (Array.isArray(d) ? d : d?.content ?? d?.data ?? []);

/**
 * Builds { "2026-11-05": { present:[], absent:[], leave:[] } } for one month.
 *  attendanceData: [{ employeeId, employeeName, date, status }]   status: PRESENT|LATE|ABSENT
 *  leaveData:      [{ employeeId, employeeName, startDate, endDate, leaveType, status }]
 */
export const buildDayMap = (attendanceData, leaveData, year, month) => {
  const { from, to } = getMonthRange(year, month);
  const monthStart = parseISO(from);
  const monthEnd = parseISO(to);
  const map = {};

  const bucket = (key) =>
    (map[key] = map[key] || { present: [], absent: [], leave: [] });
  const empKey = (r) => String(personId(r) ?? personName(r));
  const onLeave = new Set(); // "date|employee"

  // 1) Approved leaves, spread over each day inside the visible month
  asList(leaveData).forEach((l) => {
    const status = String(l.status || "APPROVED").toUpperCase();
    if (status !== "APPROVED") return;
    const start = parseISO(l.startDate || l.fromDate);
    const end = parseISO(l.endDate || l.toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

    const cursor = new Date(Math.max(start, monthStart));
    const stop = new Date(Math.min(end, monthEnd));
    while (cursor <= stop) {
      const key = dateKey(cursor);
      bucket(key).leave.push({
        name: personName(l),
        detail: l.leaveType?.name || l.leaveType || "",
      });
      onLeave.add(`${key}|${empKey(l)}`);
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  // 2) Attendance (people on leave are not counted as absent or present)
  asList(attendanceData).forEach((a) => {
    const key = String(a.date || a.attendanceDate || "").slice(0, 10);
    if (!key || onLeave.has(`${key}|${empKey(a)}`)) return;
    const status = String(a.status || "").toUpperCase();
    const person = { name: personName(a), detail: status === "LATE" ? "Late" : "" };
    if (status === "PRESENT" || status === "LATE") bucket(key).present.push(person);
    else if (status === "ABSENT") bucket(key).absent.push(person);
  });

  return map;
};

// Priority for the day color: absent > leave > present
export const dayTone = (info) => {
  if (!info) return "none";
  if (info.absent.length) return "absent";
  if (info.leave.length) return "leave";
  if (info.present.length) return "present";
  return "none";
};