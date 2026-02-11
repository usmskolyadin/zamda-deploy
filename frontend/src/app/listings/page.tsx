"use client"

import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { apiFetch } from "@/src/shared/api/base";
import { Profile } from "../profile/[id]/page";
import Sidebar from "@/src/widgets/sidebar";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { useRouter } from "next/navigation";

type Counts = {
  active: number;
  archived: number;
  moderation: number;
  rejected: number;
};

export default function ListingsClient() {
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "moderation" | "rejected">("active");
  const { user, accessToken, isInitialized } = useAuth();
  const profileId = user?.profile.id;
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [counts, setCounts] = useState<Counts>()

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, isInitialized]);


  if (!isInitialized) {
    return null; 
  }

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (!profileId) return;

    const fetchCounts = async () => {
      const res = await apiFetchAuth(`/api/ads/my/counts/`);
      setCounts(res)
      console.log(res)
    };

    fetchCounts();
  }, [profileId]);

  useEffect(() => {

    const fetchProfile = async () => {
      const res = await apiFetch(`/api/profiles/${profileId}/`);
      setProfile(res);
    };

    fetchProfile();
  }, [profileId]);

  const fetchAds = async (tab: typeof activeTab) => {
    const res = await apiFetchAuth<{ results: Advertisement[] }>(`/api/ads/my/?tab=${tab}`);
    setAds(res?.results || []);
  };

  useEffect(() => {
    if (!user) return;
    fetchAds(activeTab);
  }, [user, activeTab]);

  const activeCount = activeTab === "active" ? ads.length : 0;
  const archivedCount = activeTab === "archived" ? ads.length : 0;
  const moderationCount = activeTab === "moderation" ? ads.length : 0;
  const rejectedCount = activeTab === "rejected" ? ads.length : 0; 

  const handleRelist = async (slug: string) => {
    const confirmed = window.confirm("Are you sure you want to relist this advertisement?");
    if (!confirmed) return;

    try {
      await apiFetchAuth(`/api/ads/${slug}/relist/`, { method: "POST" });
      fetchAds(activeTab); // обновляем текущую вкладку
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to relist the advertisement");
    }
  };

  function formatTimeLeft(seconds: number) {
    if (seconds <= 0) return "Expired";
    const days = Math.floor(seconds / (3600 * 24));
    return `${days}d`;
  }

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <Sidebar notHideOnPhone={true} />

          <div className="lg:w-3/4 lg:ml-24">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px] flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>

            <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl py-4">My Listings</h1>

            <div className="grid lg:grid-cols-4 grid-cols-2 border-b mb-4">
              <button
                className={`cursor-pointer text-lg font-bold pb-2 ${
                  activeTab === "active" ? "text-black border-b-4 border-black" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("active")}
              >
                Active Listings 
                <sup className="text-sm font-medium ml-1">{counts?.active}</sup>
              </button>
              <button
                className={`cursor-pointer text-lg font-bold pb-2 ${
                  activeTab === "archived" ? "text-black border-b-4 border-black" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("archived")}
              >
                Archived 
                <sup className="text-sm font-medium ml-1">{counts?.archived}</sup>
              </button>
              <button
                className={`cursor-pointer text-lg font-bold  pb-2 ${
                  activeTab === "moderation" ? "text-black border-b-4 border-black" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("moderation")}
              > 
                Pending Review
                <sup className="text-sm font-medium ml-1">{counts?.moderation}</sup>
              </button>
              <button
                className={`cursor-pointer text-lg font-bold pb-2 ${
                  activeTab === "rejected" ? "text-black border-b-4 border-black" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("rejected")}
              >
                Not Approved 
                <sup className="text-sm font-medium ml-1">{counts?.rejected}</sup>
              </button>
            </div>

            <div className="flex flex-col">
              {ads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <img src="/not_found.png" alt="No ads available" className="w-86 h-86 object-contain" />
                  <p className="text-black text-3xl font-bold text-center">
                    {activeTab === "active"
                      ? "So far you do not have any active ads."
                      : activeTab === "archived"
                      ? "You don’t have archived ads yet."
                      : activeTab === "moderation"
                      ? "No ads on moderation."
                      : "No rejected ads."}
                  </p>
                  <p className="text-black text-xl font-medium text-center mt-2">
                    You can always create your own ad.
                  </p>
                </div>
              ) : (
                ads.map((ad) => (
                  <AdListings onRelist={handleRelist} formatTimeLeft={formatTimeLeft} ad={ad} activeTab={activeTab} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface AdListingsProps {
  ad: Advertisement
  activeTab: "active" | "archived" | "moderation" | "rejected"
  onRelist?: (slug: string) => void
  formatTimeLeft: (seconds: number) => string
}

export const AdListings = ({
  ad,
  activeTab,
  onRelist,
  formatTimeLeft,
}: AdListingsProps) => {
  const isClickable = activeTab === "active"
  const CardContent = (
    <div className="lg:flex mt-4 min-w-full hover:opacity-70 transition bg-gray-100 rounded-2xl p-2 cursor-pointer">
      <div className="lg:mr-4 flex-shrink-0">
        <img
          src={ad.images[0]?.image}
          alt={ad.title}
          className="rounded-2xl lg:h-48 lg:w-72 h-52 w-full object-cover"
          width={288}
          height={192}
        />
      </div>

      <div className="w-full lg:mr-4 lg:mt-0 mt-4 flex flex-col lg:p-0 p-2">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-lg text-black font-bold truncate pr-2">
            {ad.title}
          </h1>

          <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
            {new Date(ad.created_at).toLocaleString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex w-full items-center mt-1">
          <p className="text-lg text-gray-900 font-semibold mr-2">
            ${ad.price}
          </p>
        </div>

        <p className="text-sm text-gray-900 mt-2 line-clamp-3 break-all overflow-hidden">
          {ad.description}
        </p>

        <p className="mt-2 text-black font-medium text-sm">
          <span
            className={`text-sm font-medium mr-2 ${
              ad.status === "moderation"
                ? "text-yellow-600"
                : ad.status === "rejected"
                ? "text-red-600"
                : ad.status === "active"
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            {ad.status === "moderation" && "On moderation"}
            {ad.status === "rejected" && "Rejected"}
            {ad.status === "active" && "Active"}
            {ad.status === "archived" && "Archived"}
          </span>

          {(ad.status === "active" ||
            ad.status === "archived" ||
            ad.status === "rejected") && (
            <>
              Time left: {formatTimeLeft(ad.time_left)} <span className="text-xs italic">{ad.status === "active" ? ("(After 30 days this ad will be replaced to archive.)") : ("(After 30 days this ad will be permanently deleted.)")}</span>
            </>
          )}
        </p>

        {ad.status === "rejected" && ad.reject_reason && (
          <p className="text-sm text-red-500 mt-1">
            Reason: {ad.reject_reason}
          </p>
        )}

        {activeTab === "archived" && (
          <div className="flex gap-2 mt-2">
            <Link
              href={`/edit/${ad.slug}`}
              className="px-4 py-1 rounded-full bg-green-400 text-white hover:bg-gray-400 transition"
            >
              Edit
            </Link>

            <button
              onClick={() => onRelist?.(ad.slug)}
              className="px-4 py-1 rounded-full cursor-pointer bg-[#2AAEF7] text-white hover:bg-blue-700 transition"
            >
              Reactivate
            </button>
          </div>
        )}

        {activeTab === "rejected" && (
          <Link
            href={`/edit/${ad.slug}`}
            className="inline-block mt-2 px-4 py-1 w-40 rounded-full bg-yellow-400 text-white hover:bg-gray-400 transition"
          >
            Fix & Resubmit
          </Link>
        )}
      </div>
    </div>
  )

  return isClickable ? (
    <Link
      href={`/${ad.category_slug}/${ad.subcategory}/${ad.slug}`}
      className="block"
    >
      {CardContent}
    </Link>
  ) : (
    CardContent
  )
}