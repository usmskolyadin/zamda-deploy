"use client"

import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { useState, useRef, useEffect } from "react";

type DropdownProps = {
  chatId: number;
  accessToken: string;
};

export default function ThreeDotsDropdown({ chatId, accessToken }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
    const blockUser = async () => {
    if (!confirm("Are you sure you want to block this user?")) return;

    try {
        await apiFetchAuth(`/api/chats/${chatId}/block/`, {
        method: "POST",
        });
        alert("User blocked and chat deleted");
        window.location.href = "/messages"; // редирект после удаления чата
    } catch (err: any) {
        console.error("Failed to block user:", err);
        alert("Failed to block user: " + err.message);
    }
    };

    const reportUser = async () => {
    const reason = prompt("Reason (spam, abuse, other):");
    if (!reason) return;
    const description = prompt("Description (optional):") || "";

    try {
        await apiFetchAuth(`/api/chats/${chatId}/report/`, {
        method: "POST",
        body: JSON.stringify({ reason, description }),
        });
        alert("Report submitted");
    } catch (err: any) {
        console.error("Failed to report user:", err);
        alert("Failed to submit report: " + err.message);
    }
    };


  return (
    <div className="relative inline-block">
      <span
        className="w-10 h-10 p-2 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition"
        onClick={() => setOpen(!open)}
      >
        <svg width="24" height="5" viewBox="0 0 24 5" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.7226 4.63253C19.477 4.63253 19.2682 4.55884 19.0963 4.41147C18.9489 4.23954 18.8752 4.03077 18.8752 3.78516V1.13253C18.8752 0.886912 18.9489 0.690421 19.0963 0.543052C19.2682 0.371123 19.477 0.285156 19.7226 0.285156H22.3752C22.6209 0.285156 22.8296 0.371123 23.0016 0.543052C23.1735 0.690421 23.2595 0.886912 23.2595 1.13253V3.78516C23.2595 4.03077 23.1735 4.23954 23.0016 4.41147C22.8296 4.55884 22.6209 4.63253 22.3752 4.63253H19.7226Z" fill="black"/> <path d="M10.4404 4.63253C10.1948 4.63253 9.986 4.55884 9.81407 4.41147C9.6667 4.23954 9.59302 4.03077 9.59302 3.78516V1.13253C9.59302 0.886912 9.6667 0.690421 9.81407 0.543052C9.986 0.371123 10.1948 0.285156 10.4404 0.285156H13.093C13.3386 0.285156 13.5474 0.371123 13.7193 0.543052C13.8913 0.690421 13.9772 0.886912 13.9772 1.13253V3.78516C13.9772 4.03077 13.8913 4.23954 13.7193 4.41147C13.5474 4.55884 13.3386 4.63253 13.093 4.63253H10.4404Z" fill="black"/> <path d="M1.15792 4.63253C0.912301 4.63253 0.703529 4.55884 0.5316 4.41147C0.384231 4.23954 0.310547 4.03077 0.310547 3.78516V1.13253C0.310547 0.886912 0.384231 0.690421 0.5316 0.543052C0.703529 0.371123 0.912301 0.285156 1.15792 0.285156H3.81055C4.05616 0.285156 4.26493 0.371123 4.43686 0.543052C4.60879 0.690421 4.69476 0.886912 4.69476 1.13253V3.78516C4.69476 4.03077 4.60879 4.23954 4.43686 4.41147C4.26493 4.55884 4.05616 4.63253 3.81055 4.63253H1.15792Z" fill="black"/>
        </svg>
      </span>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-xl shadow-lg z-50">
            <button 
                className="block text-black cursor-pointer font-medium w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl" 
                onClick={blockUser} > Block user 
            </button>
            <button 
                className="block text-black cursor-pointer font-medium w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-xl" 
                onClick={reportUser} > Report 
            </button>
        </div>
      )}
    </div>
  );
}
