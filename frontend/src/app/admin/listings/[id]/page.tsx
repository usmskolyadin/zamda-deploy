"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import LoadingScreen from "@/src/components/LoadingScreen";

type AdDetail = {
  id: number;
  slug: string;
  title: string;
  description: string;
  location: string;
  owner: { id: number; username: string; first_name: string; last_name: string; profile: { id: number } };
  status: string;
  reject_reason: string | null;
  price: string;
  images: { id: number; image: string }[];
  views_count: number;
  likes_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
  status_changed_at: string;
};

type ReportRow = {
  id: number;
  reporter: { id: number; username: string };
  reason: string;
  reason_label: string;
  description: string | null;
  created_at: string;
  is_reviewed: boolean;
};

type HistoryRow = {
  id: number;
  action_time: string;
  actor: { id: number; username: string } | null;
  action: string;
  change_message: string;
};

export default function AdminListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [ad, setAd] = useState<AdDetail | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetchAuth<AdDetail>(`/api/admin/ads/${params.id}/`),
      apiFetchAuth<{ results: ReportRow[] }>(`/api/admin/reports/?ad=${params.id}`),
      apiFetchAuth<HistoryRow[]>(`/api/admin/ads/${params.id}/history/`),
    ])
      .then(([adData, reportsData, historyData]) => {
        setAd(adData);
        setReports(reportsData.results || []);
        setHistory(historyData);
      })
      .catch((err) => setError(err.message || "Failed to load listing"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [params.id]);

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setSubmitting(true);
    try {
      await apiFetchAuth(`/api/admin/ads/${params.id}/reject/`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectOpen(false);
      setRejectReason("");
      load();
    } catch (err: any) {
      alert(err.message || "Failed to reject listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading listing..." />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!ad) return null;

  const canReject = ad.status !== "rejected" && ad.status !== "archived";

  return (
    <div>
      <button onClick={() => router.push("/admin/listings")} className="text-[#2AAEF7] mb-4 cursor-pointer">
        &larr; Back to listings
      </button>

      <div className="lg:flex gap-8">
        <div className="lg:w-2/3">
          <h1 className="text-black font-bold text-2xl">{ad.title}</h1>
          <p className="text-gray-500">
            #{ad.id} &middot; {ad.location} &middot; ${Number(ad.price)}
          </p>

          <div className="flex gap-2 mt-3 overflow-x-auto">
            {ad.images.map((img) => (
              <img key={img.id} src={img.image} className="w-28 h-28 rounded-xl object-cover flex-shrink-0" />
            ))}
          </div>

          <p className="text-black mt-4 whitespace-pre-wrap">{ad.description}</p>

          {ad.reject_reason && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-semibold">Rejection reason</p>
              <p className="text-red-700">{ad.reject_reason}</p>
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-black font-bold text-lg mb-2">Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <p className="text-gray-500">No reports on this listing.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {reports.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-3">
                    <div className="flex justify-between">
                      <span className="text-black font-medium">{r.reason_label}</span>
                      <span className={`text-xs font-semibold ${r.is_reviewed ? "text-green-600" : "text-yellow-600"}`}>
                        {r.is_reviewed ? "Reviewed" : "Pending"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      by {r.reporter.username} &middot; {new Date(r.created_at).toLocaleString()}
                    </p>
                    {r.description && <p className="text-gray-700 mt-1">{r.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {reports.length > 0 && (
              <Link href={`/admin/reports?ad=${ad.id}`} className="text-[#2AAEF7] text-sm inline-block mt-2">
                Manage these reports &rarr;
              </Link>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-black font-bold text-lg mb-2">Admin history</h2>
            {history.length === 0 ? (
              <p className="text-gray-500">No administrative actions recorded for this listing yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((h) => (
                  <div key={h.id} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-black">{h.change_message}</p>
                    <p className="text-gray-400 text-xs">
                      {h.actor?.username || "system"} &middot; {new Date(h.action_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:w-1/3 mt-8 lg:mt-0">
          <div className="border border-gray-200 rounded-2xl p-4">
            <h2 className="text-black font-bold mb-2">Owner</h2>
            <Link href={`/profile/${ad.owner.profile.id}`} className="text-[#2AAEF7]">
              {ad.owner.first_name} {ad.owner.last_name} (@{ad.owner.username})
            </Link>
            <Link href={`/admin/users/${ad.owner.id}`} className="block text-[#2AAEF7] text-sm mt-1">
              View in admin &rarr;
            </Link>
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 mt-4">
            <h2 className="text-black font-bold mb-2">Stats</h2>
            <p className="text-gray-700">Views: {ad.views_count}</p>
            <p className="text-gray-700">Likes: {ad.likes_count}</p>
            <p className="text-gray-700">Status since: {new Date(ad.status_changed_at).toLocaleString()}</p>
            <p className="text-gray-700">Created: {new Date(ad.created_at).toLocaleString()}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {canReject && (
              <button
                onClick={() => setRejectOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-3xl py-3 cursor-pointer transition"
              >
                Reject listing
              </button>
            )}
          </div>
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <h2 className="text-black text-lg font-semibold mb-4">Reject listing</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this listing is being rejected (shown to the seller)"
              className="w-full border rounded-xl p-2 text-gray-900 resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-3xl border cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || submitting}
                className="px-4 py-2 rounded-3xl bg-red-500 text-white disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Rejecting..." : "Confirm reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
