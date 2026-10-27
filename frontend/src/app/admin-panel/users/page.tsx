"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import LoadingScreen from "@/src/components/LoadingScreen";

type UserRow = {
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

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export default function AdminUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<UserRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);

      apiFetchAuth<Paginated<UserRow>>(`/api/admin/users/?${params.toString()}`)
        .then(setData)
        .catch((err) => setError(err.message || "Failed to load users"))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [search, page]);

  useEffect(() => setPage(1), [search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search username, email, name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-full text-gray-900 w-72 mb-4"
      />

      {error && <p className="text-red-500">{error}</p>}
      {loading && <LoadingScreen message="Loading users..." />}

      {!loading && data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2">User</th>
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Joined</th>
                  <th className="py-2 pr-2">Listings</th>
                  <th className="py-2 pr-2">Active</th>
                  <th className="py-2 pr-2">Reports against</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin-panel/users/${u.id}`)}
                  >
                    <td className="py-2 pr-2 text-black font-medium">
                      {u.first_name} {u.last_name} (@{u.username})
                    </td>
                    <td className="py-2 pr-2 text-gray-700">{u.email}</td>
                    <td className="py-2 pr-2 text-gray-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td className="py-2 pr-2 text-gray-700">{u.ads_count}</td>
                    <td className="py-2 pr-2 text-gray-700">{u.active_ads_count}</td>
                    <td className="py-2 pr-2 text-gray-700">{u.reports_against}</td>
                    <td className="py-2 pr-2">
                      {u.is_active ? (
                        <span className="text-green-600 text-xs font-semibold">Active</span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">Banned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.results.length === 0 && <p className="text-gray-500 text-center py-8">No users found.</p>}
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
