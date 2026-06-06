"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/src/widgets/sidebar";
import LoadingScreen from "@/src/components/LoadingScreen";
import { AdBanner } from "@/src/widgets/ad";

import { useAuth } from "@/src/features/context/auth-context";
import { useAds } from "@/src/features/hooks/use-ad";

import { apiFetchAuth } from "@/src/shared/api/auth.client";



export default function FollowingPage() {
  const { user, accessToken, isInitialized } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { advs } = useAds("following");

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    const fetchFollowing = async () => {
      try {
       const res = await apiFetchAuth(
        `/api/users/me/following/`
        );
        console.log(res)
        setUsers(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [accessToken, isInitialized]);

  if (!isInitialized || loading) {
    return <LoadingScreen message="Loading following..." />;
  }

  return (
    <div className="w-full">
      <section className="bg-white pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto px-4 sm:px-6 lg:px-12">
          <Sidebar notHideOnPhone />

          <div className="lg:w-3/4 lg:ml-10 lg:mt-0 mt-2">
            <AdBanner ads={advs} height={250} />

            <h1 className="text-black font-bold lg:text-4xl text-3xl py-4">
              Following
            </h1>

            <div className="border-b pb-3 mb-5">
              <span className="text-lg font-semibold text-black">
                {users.length}
              </span>
              <span className="text-gray-500 ml-2">
                accounts followed
              </span>
            </div>

            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <img
                  src="/not_found.png"
                  alt="No following"
                  className="w-86 h-86 object-contain"
                />

                <p className="text-black text-3xl font-bold text-center">
                  You're not following anyone yet
                </p>

                <p className="text-black text-xl font-medium text-center mt-2">
                  Follow users to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
{users.map((u) => (
  <Link key={u.id} href={`/profile/${u.profile.id}`}>
    <div className="
      flex items-center justify-between
      p-5 mb-3
      rounded-3xl
      border border-gray-200
      bg-gray-100
      hover:shadow-md hover:border-gray-300
      transition
    ">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <img
          src={u.profile.avatar || "/default-avatar.png"}
          className="
            w-14 h-14
            rounded-full
            object-cover
            border border-gray-200
          "
        />

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-black text-base">
              {u.first_name} {u.last_name}
            </h3>

            {u.verification?.phone_verified && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                verified
              </span>
            )}
          </div>

          <div className="text-gray-500 text-sm">
            @{u.username}
          </div>

                  {u.profile.city ? (
                <p className=" flex text-gray-700 font-medium items-center text-sm mt-1 py-0.5">
                <svg className="mr-1 min-h-2 min-w-2" width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.03125 8.91703L19.5079 4.58356C19.8834 4.47843 20.2293 4.8244 20.1242 5.19986L15.7907 20.6765C15.6641 21.1286 15.0406 21.1728 14.8516 20.7431L11.6033 13.3607C11.553 13.2462 11.4615 13.1548 11.347 13.1044L3.9647 9.85617C3.535 9.66711 3.57919 9.04361 4.03125 8.91703Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                    {u.profile.city} 
                    <></>
                </p>
                  ) : (<></>
                  )}
        </div>
      </div>

      {/* RIGHT STATS */}
      <div className="text-right">
        <div className="text-black font-semibold">
          {u.profile.followers_count}
        </div>
        <div className="text-gray-500 text-xs">
          followers
        </div>

        <div className="text-xs text-gray-400 mt-1">
          {u.profile.following_count} following
        </div>
      </div>
    </div>
  </Link>
))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}