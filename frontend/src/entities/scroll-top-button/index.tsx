"use client";

import { ArrowBigUp, ArrowBigUpDashIcon, ArrowBigUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const scrollY = window.scrollY;

      setVisible(scrollY > 300);

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setOffset(scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed lg:right-6 right-4 cursor-pointer z-50
        transition-all duration-300 ease-out
        w-12 text-lg h-12 rounded-full
        bg-white text-black shadow-lg border border-gray-200
        flex items-center justify-center
        hover:bg-gray-100
      `}
      style={{
        bottom: Math.min(40 + offset * 0.02, 120), 
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <ArrowBigUpIcon />
    </button>
  );
}