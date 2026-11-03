import { formatDateTime, formatMoney } from "../utils/salaryHelpers";

export default function SalaryAuditLog({ entries, loading, error, currency }) {
  return (
    <div className="mt-8">
      <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">Audit Log</h2>

      {error && (
        <p className="mb-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Component</th>
              <th className="px-4 py-3 text-right">Old Amount</th>
              <th className="px-4 py-3 text-right">New Amount</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Changed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading audit log...
                </td>
              </tr>
            )}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No changes recorded yet.
                </td>
              </tr>
            )}
            {!loading &&
              entries.map((a) => (
                <tr key={a.key} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDateTime(a.changedAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{a.component}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600">
                    {formatMoney(a.oldAmount, currency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                    {formatMoney(a.newAmount, currency)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.reason || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.changedBy}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}