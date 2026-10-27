"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import LoadingScreen from "@/src/components/LoadingScreen";

type AdRow = {
  id: number;
  slug: string;
  title: string;
  owner: { username: string; first_name: string; last_name: string };
  status: "active" | "moderation" | "rejected" | "archived";
  reject_reason: string | null;
  price: string;
  thumbnail: string | null;
  views_count: number;
  likes_count: number;
  report_count: number;
  created_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

const STATUS_STYLE: Record<string, string> = {
  active: "text-green-600 bg-green-50",
  moderation: "text-yellow-600 bg-yellow-50",
  rejected: "text-red-600 bg-red-50",
  archived: "text-gray-500 bg-gray-100",
};

export default function AdminListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [minReports, setMinReports] = useState(searchParams.get("min_reports") || "");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") || "-created_at");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<Paginated<AdRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (minReports) params.set("min_reports", minReports);
      if (ordering) params.set("ordering", ordering);
      params.set("page", String(page));

      apiFetchAuth<Paginated<AdRow>>(`/api/admin/ads/?${params.toString()}`)
        .then(setData)
        .catch((err) => setError(err.message || "Failed to load listings"))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [search, statusFilter, minReports, ordering, page]);

  useEffect(() => setPage(1), [search, statusFilter, minReports, ordering]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search title, owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-full text-gray-900 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-full text-gray-900"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="moderation">Pending moderation</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
        <input
          type="number"
          min={0}
          placeholder="Min reports"
          value={minReports}
          onChange={(e) => setMinReports(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-full text-gray-900 w-36"
        />
        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-full text-gray-900"
        >
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="-report_count">Most reports</option>
          <option value="-views_count">Most views</option>
          <option value="status_changed_at">Longest in current status</option>
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <LoadingScreen message="Loading listings..." />}

      {!loading && data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2"></th>
                  <th className="py-2 pr-2">Title</th>
                  <th className="py-2 pr-2">Owner</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Views</th>
                  <th className="py-2 pr-2">Likes</th>
                  <th className="py-2 pr-2">Reports</th>
                  <th className="py-2 pr-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((ad) => (
                  <tr
                    key={ad.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin-panel/listings/${ad.id}`)}
                  >
                    <td className="py-2 pr-2">
                      {ad.thumbnail ? (
                        <img src={ad.thumbnail} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100" />
                      )}
                    </td>
                    <td className="py-2 pr-2 text-black font-medium max-w-[240px] truncate">{ad.title}</td>
                    <td className="py-2 pr-2 text-gray-700">{ad.owner.username}</td>
                    <td className="py-2 pr-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[ad.status]}`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-gray-700">{ad.views_count}</td>
                    <td className="py-2 pr-2 text-gray-700">{ad.likes_count}</td>
                    <td className="py-2 pr-2">
                      {ad.report_count > 0 ? (
                        <span className="text-red-600 font-semibold">{ad.report_count}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-gray-500">{new Date(ad.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.results.length === 0 && (
              <p className="text-gray-500 text-center py-8">No listings match these filters.</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-500 text-sm">{data.count} total</p>
            <div className="flex gap-2">
              <button
                disabled={!data.previous}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-1.5 rounded-full border border-gray-300 text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={!data.next}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1.5 rounded-full border border-gray-300 text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
