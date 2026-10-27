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
    let rafId: number | null = null;

    // avoid redundant re-renders (and the layout feedback loop that
    // comes with them) by only touching state when a rounded value
    // actually changed
    let lastMode: "normal" | "fixed" | "bottom" | null = null;
    let lastBottomOffset: number | null = null;
    let lastWidth: number | null = null;
    let lastLeft: number | null = null;

    const measure = () => {
      if (!wrapperRef.current) return;

      const wrapperRect = wrapperRef.current.getBoundingClientRect();

      const safeWidth = wrapperRect.width > 50 ? wrapperRect.width : FALLBACK_WIDTH;
      const safeLeft = wrapperRect.left !== 0 ? wrapperRect.left : 0;

      const roundedWidth = Math.round(safeWidth);
      const roundedLeft = Math.round(safeLeft);

      if (roundedWidth !== lastWidth || roundedLeft !== lastLeft) {
        lastWidth = roundedWidth;
        lastLeft = roundedLeft;
        setRect({ width: roundedWidth, left: roundedLeft });
      }

      // wrapperRect.top is always measured against the wrapper's own
      // fixed-height box (set via the `height` style below), which never
      // changes size across modes — so this is stable across renders.
      const wrapperTop = wrapperRect.top + window.scrollY;

      const footer = document.querySelector("footer");
      if (!footer) return;

      const footerTop = footer.getBoundingClientRect().top + window.scrollY;

      const scrollY = window.scrollY;
      const startSticky = wrapperTop - top;
      const stopSticky = footerTop - height - top - 32;

      let nextMode: "normal" | "fixed" | "bottom";
      let nextBottomOffset = lastBottomOffset ?? 0;

      if (scrollY < startSticky) {
        nextMode = "normal";
      } else if (scrollY >= stopSticky) {
        nextMode = "bottom";
        nextBottomOffset = Math.round(footerTop - wrapperTop - height - 32);
      } else {
        nextMode = "fixed";
      }

      if (nextMode !== lastMode) {
        lastMode = nextMode;
        setMode(nextMode);
      }

      if (nextMode === "bottom" && nextBottomOffset !== lastBottomOffset) {
        lastBottomOffset = nextBottomOffset;
        setBottomOffset(nextBottomOffset);
      }
    };

    // batch scroll/resize bursts into at most one measurement per frame
    const scheduleMeasure = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        measure();
      });
    };

    scheduleMeasure();

    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [height, top]);

  return (
    // Fixed height here is the whole fix: the ad itself is *always*
    // taken out of normal flow (absolute/fixed), so this wrapper's
    // height never changes when `mode` flips. Previously the ad sat
    // in-flow during "normal" mode on top of a same-height spacer,
    // so the wrapper was briefly ~2x taller and collapsed the instant
    // the mode switched — that sudden page-height jump is what made
    // the browser yank scrollY back near the footer.
    <div
      ref={wrapperRef}
      className={`relative hidden lg:block ${className}`}
      style={{ height }}
    >
      <div
        className={mode === "fixed" ? "fixed" : "absolute"}
        style={{
          width: `${rect.width}px`,
          left: mode === "fixed" ? `${rect.left}px` : 0,
          top: mode === "fixed" ? `${top}px` : mode === "normal" ? 0 : undefined,
          bottom: mode === "bottom" ? `-${bottomOffset}px` : undefined,
        }}
      >
        <AdsBlock
          page={page}
          height={height}
        />
      </div>
    </div>
  );
}
