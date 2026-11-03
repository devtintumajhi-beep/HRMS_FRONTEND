import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertCandidateToEmployee } from "../services/candidateService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

// "OFFER_ACCEPTED", "Offer Accepted", "offer-accepted" all count
const isOfferAccepted = (stage) =>
  String(stage || "").toUpperCase().replace(/[\s-]+/g, "_") === "OFFER_ACCEPTED";

export default function ConvertToEmployeeButton({ candidateId, name, email, phone, stage }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOfferAccepted(stage)) return null;

  const close = () => {
    if (!converting) setOpen(false);
  };

  const handleConvert = async () => {
    if (converting) return;
    setConverting(true);
    setError("");

    const result = await callApi(() => convertCandidateToEmployee(candidateId));
    setConverting(false);

    if (result.ok) {
      const d = result.data || {};
      const employeeId = d.id ?? d.employeeId ?? d.employee?.id;
      setOpen(false);
      setSuccess("Converted to employee successfully! Redirecting...");
      setTimeout(
        () => navigate(employeeId ? `/employees/${employeeId}` : "/employees"),
        1500
      );
    } else if (result.status === 409) {
      setError("This candidate has already been converted to an employee.");
    } else if (result.status === 401 || result.status === 403) {
      setError("You are not allowed to do this. Please login again.");
    } else {
      setError(getErrorMessage(result));
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
        {success}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700"
      >
        Convert to Employee
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800">Convert to Employee?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please review the details before converting.
            </p>

            <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
              <p><span className="text-gray-500">Name:</span> <b>{name || "—"}</b></p>
              <p><span className="text-gray-500">Email:</span> <b>{email || "—"}</b></p>
              <p><span className="text-gray-500">Phone:</span> <b>{phone || "—"}</b></p>
              <p>
                <span className="text-gray-500">Stage:</span>{" "}
                <b>{String(stage).replace(/_/g, " ")}</b>
              </p>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              A new employee record will be created, and the candidate's documents and
              offer letter will be linked to it.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={close}
                disabled={converting}
                className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={converting}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
              >
                {converting ? "Converting..." : "Confirm & Convert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}