"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef } from "react";

const options = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Date: Newest First", value: "date_desc" },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "relevance") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    router.push(`?${params.toString()}`);
    setOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      className="relative mt-4 py-2 w-32 flex items-center cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        className="mr-2"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path d="M14 10H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 14H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 18H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 6H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 10V20M19 20L22 17M19 20L16 17" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
      <p className="text-[#333333] mr-2">Sort by</p>

      <div
        className={`absolute top-full pb-2 mt-2 w-56 bg-white shadow-lg rounded-xl z-10 
                    transition-opacity duration-200 ease-in-out
                    ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onMouseEnter={handleMouseEnter} // Чтобы dropdown не закрывался при наведении на него
        onMouseLeave={handleMouseLeave}
      >
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="w-full text-left text-[#333333] px-4 cursor-pointer py-1.5 font-medium hover:bg-gray-100"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
