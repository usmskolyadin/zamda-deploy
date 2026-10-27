"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import LoadingScreen from "@/src/components/LoadingScreen";

type LogRow = {
  id: number;
  action_time: string;
  actor: { id: number; username: string } | null;
  action: string;
  content_type_name: string | null;
  object_id: string;
  object_repr: string;
  change_message: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export default function AdminAuditLogPage() {
  const [data, setData] = useState<Paginated<LogRow> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetchAuth<Paginated<LogRow>>(`/api/admin/audit-log/?page=${page}`)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load audit log"))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <LoadingScreen message="Loading audit log..." />}

      {!loading && data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2">When</th>
                  <th className="py-2 pr-2">Admin</th>
                  <th className="py-2 pr-2">Entity</th>
                  <th className="py-2 pr-2">What</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="py-2 pr-2 text-gray-500 whitespace-nowrap">
                      {new Date(row.action_time).toLocaleString()}
                    </td>
                    <td className="py-2 pr-2 text-black font-medium">{row.actor?.username || "system"}</td>
                    <td className="py-2 pr-2 text-gray-700">
                      {row.content_type_name} #{row.object_id} ({row.object_repr})
                    </td>
                    <td className="py-2 pr-2 text-gray-700">{row.change_message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.results.length === 0 && (
              <p className="text-gray-500 text-center py-8">No administrative actions recorded yet.</p>
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
