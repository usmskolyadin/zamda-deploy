"use client";

const PERIODS: { value: string; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
];

interface PeriodPickerProps {
  value: string;
  onChange: (value: string) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
}

export default function PeriodPicker({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: PeriodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer ${
            value === p.value
              ? "bg-[#2AAEF7] text-white border-[#2AAEF7]"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#2AAEF7]"
          }`}
        >
          {p.label}
        </button>
      ))}

      <button
        onClick={() => onChange("custom")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer ${
          value === "custom"
            ? "bg-[#2AAEF7] text-white border-[#2AAEF7]"
            : "bg-white text-gray-700 border-gray-300 hover:border-[#2AAEF7]"
        }`}
      >
        Custom
      </button>

      {value === "custom" && onCustomChange && (
        <div className="flex gap-2 items-center ml-2">
          <input
            type="date"
            value={customFrom || ""}
            onChange={(e) => onCustomChange(e.target.value, customTo || "")}
            className="border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-900"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={customTo || ""}
            onChange={(e) => onCustomChange(customFrom || "", e.target.value)}
            className="border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-900"
          />
        </div>
      )}

      <span className="text-gray-400 text-xs ml-2">(all times UTC)</span>
    </div>
  );
}
