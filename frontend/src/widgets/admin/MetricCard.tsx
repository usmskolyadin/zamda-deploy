interface MetricCardProps {
  label: string;
  value: number | string;
  changePct?: number | null;
  sublabel?: string;
}

export default function MetricCard({ label, value, changePct, sublabel }: MetricCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-black text-3xl font-bold mt-1">{value}</p>
      {changePct !== undefined && changePct !== null && (
        <p className={`text-sm font-semibold mt-1 ${changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
          {changePct >= 0 ? "+" : ""}
          {changePct}% vs previous period
        </p>
      )}
      {sublabel && <p className="text-gray-400 text-xs mt-1">{sublabel}</p>}
    </div>
  );
}
