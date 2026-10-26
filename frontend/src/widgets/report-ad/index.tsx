"use client";

import { useState } from "react";
import { apiFetchAuth } from "@/src/shared/api/auth.client";

type ReportAdReason =
  | "scam"
  | "prohibited_content"
  | "counterfeit_stolen"
  | "misleading"
  | "wrong_category_location"
  | "duplicate_spam"
  | "other";

const REASONS: { value: ReportAdReason; label: string }[] = [
  { value: "scam", label: "Scam or Fraud" },
  { value: "prohibited_content", label: "Prohibited or Inappropriate Content" },
  { value: "counterfeit_stolen", label: "Counterfeit or Stolen Item" },
  { value: "misleading", label: "Misleading Description or Photos" },
  { value: "wrong_category_location", label: "Wrong Category or Location" },
  { value: "duplicate_spam", label: "Duplicate Listing or Spam" },
  { value: "other", label: "Other" },
];

type ReportAdButtonProps = {
  adSlug: string;
  onRequireLogin?: () => void;
};

export default function ReportAdButton({ adSlug, onRequireLogin }: ReportAdButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportAdReason | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleOpen = () => {
    if (onRequireLogin) {
      onRequireLogin();
      return;
    }
    setOpen(true);
  };

  const submitReport = async () => {
    if (!reason) return;

    setLoading(true);
    try {
      await apiFetchAuth(`/api/ads/${adSlug}/report/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, description }),
      });

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setReason("");
    setDescription("");
    setSubmitted(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="absolute top-2 right-28 cursor-pointer"
        title="Report"
      >
        <div className="bg-black/30 opacity-85 hover:scale-105 transition p-2 rounded-full">
          <svg
            className="invert"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 21V4a1 1 0 0 1 1-1h11.5a1 1 0 0 1 .8 1.6L15.75 9l3.55 4.4a1 1 0 0 1-.8 1.6H6"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="fixed text-black inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            {submitted ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Report submitted</h2>
                <p className="text-gray-700 mb-6">
                  Thank you — our team will review this listing shortly.
                </p>
                <div className="flex justify-end">
                  <button
                    className="hover:opacity-90 cursor-pointer px-4 py-2 rounded-3xl border"
                    onClick={close}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4">Report Listing</h2>

                <div className="space-y-2 mb-4">
                  <label className="block font-medium">Why?</label>

                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="ad-report-reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    className="w-full border rounded-3xl p-2 resize-none"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    className="hover:opacity-90 cursor-pointer px-4 py-2 rounded-3xl border"
                    onClick={close}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="hover:opacity-90 cursor-pointer px-4 py-2 rounded-3xl bg-red-500 text-white disabled:opacity-50"
                    onClick={submitReport}
                    disabled={!reason || loading}
                  >
                    {loading ? "Sending..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
