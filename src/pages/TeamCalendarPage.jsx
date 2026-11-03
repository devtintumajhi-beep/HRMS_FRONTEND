import TeamCalendar from "../components/TeamCalendar";

export default function TeamCalendarPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800">Team Attendance & Leave</h1>
      <p className="mb-5 mt-1 text-sm text-gray-500">
        See who is present, absent or on leave. Hover over a day for details.
      </p>
      <TeamCalendar />
    </div>
  );
}