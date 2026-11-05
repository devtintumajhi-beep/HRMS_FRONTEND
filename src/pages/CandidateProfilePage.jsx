import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import {
  convertCandidateToEmployee,
  getCandidateById,
} from "../services/candidateService";
import { callApi } from "../utils/callApi";
import { getErrorMessage } from "../utils/getErrorMessage";

// "OFFER_ACCEPTED", "Offer Accepted", "offer-accepted" all count
const isOfferAccepted = (stage) =>
  String(stage || "").toUpperCase().replace(/[\s-]+/g, "_") === "OFFER_ACCEPTED";

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-400">{label}</p>
      <div className="mt-1 text-sm text-gray-800">{children || "—"}</div>
    </div>
  );
}

export default function CandidateProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => getCandidateById(id));
      if (result.ok) setCandidate(result.data);
      else if (result.status === 404) setLoadError("Candidate not found.");
      else setLoadError(getErrorMessage(result));
      setLoading(false);
    })();
  }, [id]);

  const fullName = candidate
    ? candidate.fullName ||
      `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim()
    : "";
  const stage = candidate?.stage || candidate?.status;
  const canConvert = candidate && isOfferAccepted(stage);

  const openConfirm = () => {
    setConvertError("");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (!converting) setConfirmOpen(false);
  };

  const handleConvert = async () => {
    if (converting) return;
    setConverting(true);
    setConvertError("");

    const result = await callApi(() => convertCandidateToEmployee(id));
    setConverting(false);

    if (result.ok) {
      const d = result.data || {};
      const employeeId = d.id ?? d.employeeId ?? d.employee?.id;
      setSuccess("Candidate converted to employee successfully! Redirecting...");
      setConfirmOpen(false);
      setTimeout(
        () => navigate(employeeId ? `/employees/${employeeId}` : "/employees"),
        1500
      );
    } else if (result.status === 409) {
      setConvertError("This candidate has already been converted to an employee.");
    } else if (result.status === 401 || result.status === 403) {
      setConvertError("You are not allowed to do this. Please login again.");
    } else if (result.status === 400) {
      setConvertError(
        getErrorMessage(result) ||
          "The candidate is not ready to be converted. Check the stage."
      );
    } else {
      setConvertError(getErrorMessage(result));
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <Link to="/recruitment" className="text-sm text-blue-600 hover:underline">
        ← Back to Recruitment
      </Link>

      <h1 className="mb-6 mt-3 text-2xl font-bold text-gray-800">CandidaeE Profile</h1>

      <Alert type="error" message={loadError} />
      <Alert type="success" message={success} />
      {loading && <p className="text-gray-400">Loading candidate...</p>}

      {candidate && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Name">{fullName}</Field>
            <Field label="Stage">
              <StatusBadge status={stage} label={String(stage || "").replace(/_/g, " ")} />
            </Field>
            <Field label="Email">{candidate.email}</Field>
            <Field label="Phone">{candidate.phone}</Field>
            <Field label="Applied For">
              {candidate.jobTitle || candidate.position || candidate.job?.title}
            </Field>
            <Field label="Resume">
              {(candidate.resumeS3Url || candidate.resumeUrl) && (
                <a
                  href={candidate.resumeS3Url || candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open resume
                </a>
              )}
            </Field>
          </div>

          {canConvert && !success && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <button
                onClick={openConfirm}
                className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700"
              >
                Convert to Employee
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirmation summary */}
      {confirmOpen && candidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeConfirm}
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
              <p><span className="text-gray-500">Name:</span> <b>{fullName || "—"}</b></p>
              <p><span className="text-gray-500">Email:</span> <b>{candidate.email || "—"}</b></p>
              <p><span className="text-gray-500">Phone:</span> <b>{candidate.phone || "—"}</b></p>
              <p>
                <span className="text-gray-500">Stage:</span>{" "}
                <b>{String(stage || "").replace(/_/g, " ")}</b>
              </p>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              A new employee record will be created from this candidate.
            </p>

            {convertError && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                {convertError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
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
    </div>
  );
}