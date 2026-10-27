"use client";

import { useState } from "react";

type Point = { date: string; count: number };

interface LineChartProps {
  data: Point[];
  color?: string;
  height?: number;
  emptyLabel?: string;
}

export default function LineChart({
  data,
  color = "#2AAEF7",
  height = 160,
  emptyLabel = "No data for this period",
}: LineChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  const width = 600;
  const padding = 20;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding + i * stepX,
    y: height - padding - (d.count / max) * (height - padding * 2),
    ...d,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((f) => {
          const y = height - padding - f * (height - padding * 2);
          return <line key={f} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#F0F0F0" strokeWidth={1} />;
        })}
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#E5E5E5" strokeWidth={1} />

        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - stepX / 2}
              y={0}
              width={stepX || width}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: "pointer" }}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIdx === i ? 5 : 4}
              fill={color}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.6}
              pointerEvents="none"
            />
          </g>
        ))}
      </svg>

      {hovered && (
        <div
          className="absolute bg-black text-white text-xs rounded-lg px-2 py-1 pointer-events-none whitespace-nowrap z-10"
          style={{
            left: `${(hovered.x / width) * 100}%`,
            top: `${Math.max(0, (hovered.y / height) * 100 - 15)}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {hovered.date}: {hovered.count}
        </div>
      )}
    </div>
  );
}
