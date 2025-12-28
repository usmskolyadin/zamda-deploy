"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  absolute?: boolean;     
  className?: string;
}

export default function BackButton({ absolute = false, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`
        flex items-center cursor-pointer border border-black justify-center p-2 rounded-full hover:bg-gray-200 transition
        ${absolute ? "absolute right-0 top-[-2]" : "static"}
        ${className || ""}
      `}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
