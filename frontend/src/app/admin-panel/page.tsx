"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import MetricCard from "@/src/widgets/admin/MetricCard";
import PeriodPicker from "@/src/widgets/admin/PeriodPicker";
import LineChart from "@/src/widgets/admin/LineChart";
import LoadingScreen from "@/src/components/LoadingScreen";

type PeriodStat = { current: number; previous: number; change_pct: number | null };
type SeriesPoint = { date: string; count: number };

type Overview = {
  period: { start: string; end: string; timezone: string };
  users: { total: number; banned: number; registrations: PeriodStat };
  ads: { by_status: Record<string, number>; created: PeriodStat };
  reports: {
    total: number; unreviewed: number; received: PeriodStat;
    ads_with_reports: number; ads_with_multiple_reports: number;
  };
  engagement: { views: PeriodStat; likes: PeriodStat };
  series: { registrations: SeriesPoint[]; ads_created: SeriesPoint[]; reports: SeriesPoint[] };
  needs_attention: { type: string; label: string; link: string; count: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  moderation: "Pending moderation",
  rejected: "Rejected",
  archived: "Archived",
};

export default function AdminOverviewPage() {
  const [period, setPeriod] = useState("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (period === "custom" && (!customFrom || !customTo)) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ period });
    if (period === "custom") {
      params.set("from", customFrom);
      params.set("to", customTo);
    }

    apiFetchAuth<Overview>(`/api/admin/overview/?${params.toString()}`)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load overview"))
      .finally(() => setLoading(false));
  }, [period, customFrom, customTo]);

  return (
    <div>
      <PeriodPicker
        value={period}
        onChange={setPeriod}
        customFrom={customFrom}
        customTo={customTo}
        onCustomChange={(f, t) => {
          setCustomFrom(f);
          setCustomTo(t);
        }}
      />

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {loading && !data && (
        <div className="mt-8">
          <LoadingScreen message="Loading overview..." />
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="text-black font-bold text-xl mb-3">Needs attention</h2>
            {data.needs_attention.length === 0 ? (
              <p className="text-gray-500 bg-gray-50 rounded-2xl p-4">
                Nothing urgent right now.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.needs_attention.map((item) => (
                  <Link
                    key={item.type}
                    href={item.link}
                    className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 hover:bg-yellow-100 transition"
                  >
                    <span className="text-black font-medium">{item.label}</span>
                    <span className="text-[#2AAEF7] font-bold">View &rarr;</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-black font-bold text-xl mb-3">Users</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total users" value={data.users.total} />
              <MetricCard label="Banned" value={data.users.banned} />
              <MetricCard
                label="New registrations"
                value={data.users.registrations.current}
                changePct={data.users.registrations.change_pct}
              />
            </div>
            <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
              <LineChart data={data.series.registrations} />
            </div>
          </section>

          <section>
            <h2 className="text-black font-bold text-xl mb-3">Listings</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <MetricCard key={key} label={label} value={data.ads.by_status[key] ?? 0} />
              ))}
              <MetricCard
                label="Created this period"
                value={data.ads.created.current}
                changePct={data.ads.created.change_pct}
              />
            </div>
            <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
              <LineChart data={data.series.ads_created} />
            </div>
          </section>

          <section>
            <h2 className="text-black font-bold text-xl mb-3">Reports</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total reports" value={data.reports.total} />
              <MetricCard label="Awaiting review" value={data.reports.unreviewed} />
              <MetricCard
                label="Received this period"
                value={data.reports.received.current}
                changePct={data.reports.received.change_pct}
              />
              <MetricCard label="Listings with 2+ reports" value={data.reports.ads_with_multiple_reports} />
            </div>
            <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
              <LineChart data={data.series.reports} color="#DC2626" />
            </div>
          </section>

          <section>
            <h2 className="text-black font-bold text-xl mb-3">Engagement</h2>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Views this period"
                value={data.engagement.views.current}
                changePct={data.engagement.views.change_pct}
              />
              <MetricCard
                label="Likes this period"
                value={data.engagement.likes.current}
                changePct={data.engagement.likes.change_pct}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
