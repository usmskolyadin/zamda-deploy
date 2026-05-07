"use client";

import { useEffect, useRef, useState } from "react";
import AdsBlock from "./AdBannerClient";

interface StickyAdBlockProps {
  page: string;
  height?: number;

  // offset от верха (header + nav)
  top?: number;

  // ширина fixed banner
  width?: string;

  // footer selector
  footerSelector?: string;

  // className wrapper
  className?: string;
}

export function StickyAdBlock({
  page,
  height = 500,
  top = 145,
  width = "380px",
  footerSelector = "footer",
  className = "",
}: StickyAdBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSticky, setIsSticky] = useState(false);
  const [stop, setStop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      const footer = document.querySelector(footerSelector);

      let footerTop = Infinity;

      if (footer) {
        footerTop = footer.getBoundingClientRect().top;
      }

      // start sticky
      if (rect.top <= top) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      // stop before footer
      if (footerTop <= height + top) {
        setStop(true);
      } else {
        setStop(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [top, height, footerSelector]);

  return (
    <div
      ref={containerRef}
      className={`relative hidden lg:block ${className}`}
      style={{ height }}
    >
      <div
        className={
          stop
            ? "absolute bottom-0 left-0 w-full"
            : isSticky
            ? "fixed"
            : "relative"
        }
        style={
          isSticky && !stop
            ? {
                top,
                width,
              }
            : undefined
        }
      >
        <AdsBlock page={page} height={height} />
      </div>
    </div>
  );
}