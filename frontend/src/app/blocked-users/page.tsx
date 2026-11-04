"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/src/widgets/sidebar";
import LoadingScreen from "@/src/components/LoadingScreen";
import { AdBanner } from "@/src/widgets/ad";

import { useAuth } from "@/src/features/context/auth-context";
import { useAds } from "@/src/features/hooks/use-ad";

import { apiFetchAuth } from "@/src/shared/api/auth.client";

interface BlockedUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export default function BlockedUsersPage() {
  const { accessToken, isInitialized } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  const { advs } = useAds("blocked-users");

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    const fetchBlocked = async () => {
      try {
        const res = await apiFetchAuth<BlockedUser[]>(`/api/users/me/blocked/`);
        setUsers(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocked();
  }, [accessToken, isInitialized]);

  const handleUnblock = async (userId: number) => {
    setUnblockingId(userId);
    try {
      await apiFetchAuth(`/api/users/${userId}/unblock/`, {
        method: "POST",
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setUnblockingId(null);
    }
  };

  if (!isInitialized || loading) {
    return <LoadingScreen message="Loading blocked users..." />;
  }

  return (
    <div className="w-full">
      <section className="bg-white pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto px-4 sm:px-6 lg:px-12">
          <Sidebar notHideOnPhone />

          <div className="lg:w-3/4 lg:ml-10 lg:mt-0 mt-2 min-w-0">
            <div className="hidden lg:block">
              <AdBanner ads={advs} height={300} />
            </div>

            <h1 className="text-black font-bold lg:text-4xl text-3xl py-4">
              Blocked users
            </h1>

            <div className="border-b pb-3 mb-5">
              <span className="text-lg font-semibold text-black">
                {users.length}
              </span>
              <span className="text-gray-500 ml-2">
                blocked accounts
              </span>
            </div>

            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <img
                  src="/not_found.png"
                  alt="No blocked users"
                  className="w-56 h-56 object-contain"
                />

                <p className="text-black text-3xl font-bold text-center">
                  You haven't blocked anyone
                </p>

                <p className="text-black text-xl font-medium text-center mt-2">
                  Users you block will show up here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="
                      flex items-center justify-between gap-3
                      p-5 mb-3
                      rounded-3xl
                      border border-gray-200
                      bg-gray-100
                      transition
                    "
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={u.avatar || "/default-avatar.png"}
                        alt=""
                        className="
                          min-w-14 max-w-14 min-h-14 max-h-14
                          rounded-full
                          object-cover
                          border border-gray-200
                        "
                      />

                      <div className="min-w-0">
                        <h3 className="font-bold text-black text-base truncate">
                          {u.first_name} {u.last_name}
                        </h3>
                        <p className="text-gray-500 text-sm truncate">
                          @{u.username}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblock(u.id)}
                      disabled={unblockingId === u.id}
                      className="
                        flex-shrink-0
                        cursor-pointer
                        border border-black
                        hover:bg-black hover:text-white
                        transition
                        px-5 py-2
                        rounded-full
                        text-black font-medium
                        disabled:opacity-50
                      "
                    >
                      {unblockingId === u.id ? "Unblocking..." : "Unblock"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
