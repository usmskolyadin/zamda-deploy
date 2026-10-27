"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import LoadingScreen from "@/src/components/LoadingScreen";

type ReportRow = {
  id: number;
  ad_id: number;
  ad_title: string;
  ad_slug: string;
  ad_status: string;
  reporter: { id: number; username: string };
  reason: string;
  reason_label: string;
  description: string | null;
  created_at: string;
  is_reviewed: boolean;
  reviewed_by: { id: number; username: string } | null;
  reviewed_at: string | null;
};

type TopAdRow = {
  id: number;
  slug: string;
  title: string;
  owner_username: string;
  status: string;
  total_reports: number;
  unique_reporters: number;
  reports_last_24h: number;
  reports_last_7d: number;
  last_report_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"queue" | "top">(searchParams.get("ad") ? "queue" : "queue");
  const adFilter = searchParams.get("ad");

  const [queue, setQueue] = useState<Paginated<ReportRow> | null>(null);
  const [topAds, setTopAds] = useState<Paginated<TopAdRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const loadQueue = () => {
    setLoading(true);
    const params = new URLSearchParams({ ordering: "-created_at" });
    if (!adFilter) params.set("is_reviewed", "false");
    if (adFilter) params.set("ad", adFilter);

    apiFetchAuth<Paginated<ReportRow>>(`/api/admin/reports/?${params.toString()}`)
      .then(setQueue)
      .catch((err) => setError(err.message || "Failed to load reports"))
      .finally(() => setLoading(false));
  };

  const loadTopAds = () => {
    setLoading(true);
    apiFetchAuth<Paginated<TopAdRow>>(`/api/admin/reports/top-ads/`)
      .then(setTopAds)
      .catch((err) => setError(err.message || "Failed to load top reported listings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setError(null);
    if (tab === "queue") loadQueue();
    else loadTopAds();
  }, [tab, adFilter]);

  const handleResolve = async (id: number) => {
    setResolvingId(id);
    try {
      await apiFetchAuth(`/api/admin/reports/${id}/resolve/`, { method: "POST" });
      loadQueue();
    } catch (err: any) {
      alert(err.message || "Failed to resolve report");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("queue")}
          className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${
            tab === "queue" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {adFilter ? "Reports for this listing" : "Pending queue"}
        </button>
        <button
          onClick={() => setTab("top")}
          className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${
            tab === "top" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          Top reported listings
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <LoadingScreen message="Loading..." />}

      {!loading && tab === "queue" && queue && (
        <div className="flex flex-col gap-3">
          {queue.results.length === 0 && (
            <p className="text-gray-500 bg-gray-50 rounded-2xl p-4">
              {adFilter ? "No reports for this listing." : "No reports waiting for review."}
            </p>
          )}
          {queue.results.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/admin-panel/listings/${r.ad_id}`} className="text-[#2AAEF7] font-semibold">
                    {r.ad_title}
                  </Link>
                  <p className="text-black font-medium mt-1">{r.reason_label}</p>
                  {r.description && <p className="text-gray-700 mt-1">{r.description}</p>}
                  <p className="text-gray-400 text-sm mt-1">
                    reported by {r.reporter.username} &middot; {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                {!r.is_reviewed ? (
                  <button
                    onClick={() => handleResolve(r.id)}
                    disabled={resolvingId === r.id}
                    className="px-4 py-2 rounded-3xl bg-black text-white disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {resolvingId === r.id ? "Saving..." : "Mark reviewed"}
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold text-sm shrink-0">
                    Reviewed by {r.reviewed_by?.username}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "top" && topAds && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-2">Listing</th>
                <th className="py-2 pr-2">Owner</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Total reports</th>
                <th className="py-2 pr-2">Unique reporters</th>
                <th className="py-2 pr-2">Last 24h</th>
                <th className="py-2 pr-2">Last 7d</th>
                <th className="py-2 pr-2">Last report</th>
              </tr>
            </thead>
            <tbody>
              {topAds.results.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-2">
                    <Link href={`/admin-panel/listings/${row.id}`} className="text-[#2AAEF7] font-medium">
                      {row.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-2 text-gray-700">{row.owner_username}</td>
                  <td className="py-2 pr-2 text-gray-700">{row.status}</td>
                  <td className="py-2 pr-2 text-red-600 font-semibold">{row.total_reports}</td>
                  <td className="py-2 pr-2 text-gray-700">{row.unique_reporters}</td>
                  <td className="py-2 pr-2 text-gray-700">
                    {row.reports_last_24h > 0 ? (
                      <span className="text-red-600 font-semibold">{row.reports_last_24h}</span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="py-2 pr-2 text-gray-700">{row.reports_last_7d}</td>
                  <td className="py-2 pr-2 text-gray-500">{new Date(row.last_report_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topAds.results.length === 0 && (
            <p className="text-gray-500 text-center py-8">No reported listings.</p>
          )}
        </div>
      )}
    </div>
  );
}
