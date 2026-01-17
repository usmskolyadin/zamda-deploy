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

export default function Listings() {
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "moderation" | "rejected">("active");
  const { user } = useAuth();
  const profileId = user?.profile.id;

  const [profile, setProfile] = useState<any>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    if (!profileId) return;

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
                {/* <sup className="text-xs font-medium">{activeCount}</sup> */}
              </button>
              <button
                className={`cursor-pointer text-lg font-bold pb-2 ${
                  activeTab === "archived" ? "text-black border-b-4 border-black" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("archived")}
              >
                Archived 
                {/* <sup className="text-xs font-medium">{archivedCount}</sup> */}
              </button>
              <button
                className={`cursor-pointer text-lg font-bold  pb-2 ${
                  activeTab === "moderation" ? "text-black border-b-4 border-black" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("moderation")}
              >
                On Moderation 
                {/* <sup className="text-xs font-medium">{moderationCount}</sup> */}
              </button>
              <button
                className={`cursor-pointer text-lg font-bold pb-2 ${
                  activeTab === "rejected" ? "text-black border-b-4 border-black" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("rejected")}
              >
                Rejected 
                {/* <sup className="text-xs font-medium">{rejectedCount}</sup> */}
              </button>
            </div>

            {/* Ads List */}
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
                    <div className="lg:flex mt-4 min-w-full hover:opacity-70 transition bg-gray-100 rounded-2xl p-2">
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
                        <Link key={ad.id} href={`/${ad.category_slug}/${ad.subcategory}/${ad.slug}`}>
                                <h1 className="text-xl text-black font-bold truncate pr-2">{ad.title}</h1>
                        </Link>
                          <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                            {new Date(ad.created_at).toLocaleString("en-US", {
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex w-full items-center mt-1">
                          <p className="text-lg text-gray-900 font-semibold mr-2">${ad.price}</p>
                        </div>

                        <p className="text-md text-gray-900 mt-2 line-clamp-3 break-all overflow-hidden">
                          {ad.description}
                        </p>

                        {/* Status */}
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
                          {activeTab === "active" || activeTab === "archived" ? (
                            <>
                              Times left: {formatTimeLeft(ad.time_left)}
                              {ad.status === "archived" && (
                                <span className="ml-1 text-gray-500">(Archived)</span>
                              )}
                            </>
                          ) : null}
                        </p>

                        {ad.status === "rejected" && ad.reject_reason && (
                          <p className="text-sm text-red-500 mt-1">Reason: {ad.reject_reason}</p>
                        )}

                        {activeTab === "archived" && (
                          <button
                            onClick={() => handleRelist(ad.slug)}
                            className="cursor-pointer px-4 py-1 w-48 my-2 rounded-full bg-[#2AAEF7] text-white hover:bg-blue-700 transition"
                          >
                            Renew Listing
                          </button>
                        )}
                      </div>
                    </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
