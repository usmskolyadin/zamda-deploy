"use client";

import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { useState, useRef, useEffect } from "react";

type DropdownProps = {
  chatId: number;
};

type ReportReason = "spam" | "abuse" | "other";

export default function ThreeDotsDropdown({ chatId }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // report state
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const blockUser = async () => {
    if (!confirm("Are you sure you want to block this user?")) return;

    try {
      await apiFetchAuth(`/api/chats/${chatId}/block/`, {
        method: "POST",
      });
      alert("User blocked and chat deleted");
      window.location.href = "/messages";
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteChat = async () => {
    if (!confirm("Are you sure you want to delete chat with this user?")) return;

    try {
      await apiFetchAuth(`/api/chats/${chatId}/block/`, {
        method: "POST",
      });
      window.location.href = "/messages";
    } catch (err: any) {
      alert(err.message);
    }
  };

  const submitReport = async () => {
    if (!reason) return;

    setLoading(true);
    try {
      await apiFetchAuth(`/api/chats/${chatId}/report/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          description,
        }),
      });

      alert("Report submitted");
      setShowReportModal(false);
      setReason("");
      setDescription("");
    } catch (err: any) {
      alert("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Dropdown */}
      <div className="relative inline-block" ref={dropdownRef}>
        <span
          className="w-10 h-10 p-2 text-black flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition"
          onClick={() => setOpen(!open)}
        >
          <svg width="24" height="5" viewBox="0 0 24 5" fill="currentColor">
            <circle cx="2.5" cy="2.5" r="2.5" />
            <circle cx="12" cy="2.5" r="2.5" />
            <circle cx="21.5" cy="2.5" r="2.5" />
          </svg>
        </span>

        {open && (
          <div className="absolute text-black right-0 mt-2 w-48 bg-white border border-gray-300 rounded-xl shadow-lg z-50">
            <button
              className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl"
              onClick={blockUser}
            >
              Block user
            </button>
            <button
              className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl"
              onClick={deleteChat}
            >
              Delete chat
            </button>
            <button
              className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-xl"
              onClick={() => {
                setShowReportModal(true);
                setOpen(false);
              }}
            >
              Report
            </button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed text-black inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              Report user
            </h2>

            {/* Reason */}
            <div className="space-y-2 mb-4">
              <label className="block font-medium">Reason</label>

              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value="spam"
                  checked={reason === "spam"}
                  onChange={() => setReason("spam")}
                />
                Spam
              </label>

              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value="abuse"
                  checked={reason === "abuse"}
                  onChange={() => setReason("abuse")}
                />
                Abuse
              </label>

              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value="other"
                  checked={reason === "other"}
                  onChange={() => setReason("other")}
                />
                Other
              </label>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Description (optional)
              </label>
              <textarea
                className="w-full border rounded-lg p-2 resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                className="hover:opacity-90 cursor-pointer px-4 py-2 rounded-lg border"
                onClick={() => setShowReportModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="hover:opacity-90 cursor-pointer px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
                onClick={submitReport}
                disabled={!reason || loading}
              >
                {loading ? "Sending..." : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
