"use client";

import { useEffect, useRef, useState } from "react";
import AdsBlock from "./AdBannerClient";

interface StickyAdBlockProps {
  page: string;
  height?: number;
  top?: number;
  className?: string;
}

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

  const [width, setWidth] = useState(360);

  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const wrapper = wrapperRef.current;

      const wrapperTop =
        wrapper.getBoundingClientRect().top +
        window.scrollY;

      const footer =
        document.querySelector("footer");

      if (!footer) return;

      const footerTop =
        footer.getBoundingClientRect().top +
        window.scrollY;

      const scrollY = window.scrollY;

      const startSticky = wrapperTop - top;

      const stopSticky =
        footerTop - height - top - 32;

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

      setWidth(wrapper.offsetWidth);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, [height, top]);

  return (
    <div
      ref={wrapperRef}
      className={`relative hidden lg:block ${className}`}
    >
      <div
        className={
          mode === "fixed"
            ? "fixed"
            : mode === "bottom"
            ? "absolute"
            : "relative"
        }
        style={{
          width: `${width}px`,

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