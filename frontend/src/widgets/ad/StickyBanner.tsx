"use client";

import { useEffect, useRef, useState } from "react";
import AdsBlock from "./AdBannerClient";

interface StickyAdBlockProps {
  page: string;
  height?: number;
  top?: number;
  className?: string;
}

const FALLBACK_WIDTH = 300;

export default function StickyAdBlock({
  page,
  height = 500,
  top = 145,
  className = "",
}: StickyAdBlockProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<
    "normal" | "fixed" | "bottom"
  >("normal");

  const [rect, setRect] = useState({
    width: 360,
    left: 0,
  });

  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();

      console.log("=== RESIZE ===", rect.width, rect.left);

      // ❗️КРИТИЧНО
      const safeWidth = rect.width > 50 ? rect.width : FALLBACK_WIDTH;
      const safeLeft = rect.left !== 0 ? rect.left : undefined;

      setRect({
        width: safeWidth,
        left: safeLeft ?? 0,
      });
    };

    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const wrapper = wrapperRef.current;
      const wrapperTop =
        wrapper.getBoundingClientRect().top +
        window.scrollY;

      const footer = document.querySelector("footer");
      if (!footer) return;

      const footerTop =
        footer.getBoundingClientRect().top +
        window.scrollY;

      const scrollY = window.scrollY;
      const startSticky = wrapperTop - top;
      const stopSticky = footerTop - height - top - 32;

      if (scrollY < startSticky) {
        setMode("normal");
      } else if (scrollY >= stopSticky) {
        setMode("bottom");
        setBottomOffset(
          footerTop - wrapperTop - height - 32
        );
      } else {
        setMode("fixed");
      }
    };

    handleResize();
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [height, top]);

  return (
    <div
      ref={wrapperRef}
      className={`relative hidden lg:block ${className}`}
    >
      <div
        className={`transition-all duration-300 ${
          mode === "fixed"
            ? "fixed"
            : mode === "bottom"
            ? "absolute"
            : "relative"
        }`}
        style={{
          width: mode === "fixed" ? `${rect.width}px` : undefined,
          left: mode === "fixed" ? `${rect.left}px` : undefined,
          top:
            mode === "fixed"
              ? `${top}px`
              : undefined,

          bottom:
            mode === "bottom"
              ? `-${bottomOffset}px`
              : undefined,
        }}
      >
        <AdsBlock
          page={page}
          height={height}
        />
      </div>

      {/* spacer */}
      <div style={{ height }} />
    </div>
  );
}