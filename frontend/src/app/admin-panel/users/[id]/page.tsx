"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import LoadingScreen from "@/src/components/LoadingScreen";

type UserDetail = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  ads_count: number;
  active_ads_count: number;
  reports_against: number;
};

type AdRow = { id: number; title: string; status: string; views_count: number; report_count: number };

type HistoryRow = {
  id: number;
  action_time: string;
  actor: { id: number; username: string } | null;
  change_message: string;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [ads, setAds] = useState<AdRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetchAuth<UserDetail>(`/api/admin/users/${params.id}/`),
      apiFetchAuth<{ results: AdRow[] }>(`/api/admin/ads/?owner=${params.id}`),
      apiFetchAuth<HistoryRow[]>(`/api/admin/users/${params.id}/history/`),
    ])
      .then(([u, adsData, historyData]) => {
        setUser(u);
        setAds(adsData.results || []);
        setHistory(historyData);
      })
      .catch((err) => setError(err.message || "Failed to load user"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [params.id]);

  const handleBan = async () => {
    if (!banReason.trim()) return;
    setSubmitting(true);
    try {
      await apiFetchAuth(`/api/admin/users/${params.id}/ban/`, {
        method: "POST",
        body: JSON.stringify({ reason: banReason }),
      });
      setBanOpen(false);
      setBanReason("");
      load();
    } catch (err: any) {
      alert(err.message || "Failed to ban user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnban = async () => {
    if (!confirm("Unban this user?")) return;
    setSubmitting(true);
    try {
      await apiFetchAuth(`/api/admin/users/${params.id}/unban/`, { method: "POST" });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to unban user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading user..." />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return null;

  return (
    <div>
      <button onClick={() => router.push("/admin-panel/users")} className="text-[#2AAEF7] mb-4 cursor-pointer">
        &larr; Back to users
      </button>

      <div className="lg:flex gap-8">
        <div className="lg:w-2/3">
          <h1 className="text-black font-bold text-2xl">
            {user.first_name} {user.last_name} (@{user.username})
          </h1>
          <p className="text-gray-500">
            {user.email} &middot; joined {new Date(user.date_joined).toLocaleDateString()}
          </p>
          <p className="mt-1">
            {user.is_active ? (
              <span className="text-green-600 font-semibold">Active</span>
            ) : (
              <span className="text-red-600 font-semibold">Banned</span>
            )}
          </p>

          <section className="mt-8">
            <h2 className="text-black font-bold text-lg mb-2">Listings ({ads.length})</h2>
            {ads.length === 0 ? (
              <p className="text-gray-500">No listings.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {ads.map((ad) => (
                  <Link
                    key={ad.id}
                    href={`/admin-panel/listings/${ad.id}`}
                    className="flex justify-between border border-gray-200 rounded-xl p-3 hover:bg-gray-50"
                  >
                    <span className="text-black font-medium">{ad.title}</span>
                    <span className="text-gray-500 text-sm">
                      {ad.status} &middot; {ad.views_count} views
                      {ad.report_count > 0 && <span className="text-red-600"> &middot; {ad.report_count} reports</span>}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-black font-bold text-lg mb-2">Admin history</h2>
            {history.length === 0 ? (
              <p className="text-gray-500">No administrative actions recorded for this user yet.</p>
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
            <h2 className="text-black font-bold mb-2">Stats</h2>
            <p className="text-gray-700">Listings: {user.ads_count}</p>
            <p className="text-gray-700">Active listings: {user.active_ads_count}</p>
            <p className="text-gray-700">Reports against their listings: {user.reports_against}</p>
          </div>

          <div className="mt-4">
            {user.is_active ? (
              <button
                onClick={() => setBanOpen(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-3xl py-3 cursor-pointer transition"
              >
                Ban user
              </button>
            ) : (
              <button
                onClick={handleUnban}
                disabled={submitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-3xl py-3 cursor-pointer transition disabled:opacity-50"
              >
                Unban user
              </button>
            )}
          </div>
        </div>
      </div>

      {banOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <h2 className="text-black text-lg font-semibold mb-4">Ban user</h2>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for banning this user"
              className="w-full border rounded-xl p-2 text-gray-900 resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setBanOpen(false)} disabled={submitting} className="px-4 py-2 rounded-3xl border cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={!banReason.trim() || submitting}
                className="px-4 py-2 rounded-3xl bg-red-500 text-white disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Banning..." : "Confirm ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
