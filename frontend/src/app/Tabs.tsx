"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiFetch } from "@/src/shared/api/base";
import { Advertisement, PaginatedResponse } from "../entities/advertisment/model/types";
import { apiFetchAuth } from "../shared/api/auth.client";
import { useAuth } from "../features/context/auth-context";

const tabs = [
  { id: "recommendations", label: "Recommendations" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recently Viewed" },
];

export default function TabsExample() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const PAGE_SIZE = 12;

  const [activeTab, setActiveTab] = useState("recommendations");
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [likedAds, setLikedAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchLikedAds = async () => {
      try {
        const res = await apiFetchAuth<{ results?: Advertisement[] }>(`/api/ads/liked/?status=active`);
        const adsData = res.results ?? (Array.isArray(res) ? res : []);
        setLikedAds(adsData);
      } catch (e) {
        console.error("Error loading liked ads:", e);
      }
    };

    fetchLikedAds();
  }, [user]);

  const fetchAdsByTab = async (tabId: string, pageNum = 1) => {
    setLoading(true);

    try {
      if (tabId === "favorites") {
        setAds(likedAds);
        setHasNext(false);
        return;
      }

      let url = `/api/ads/?page=${pageNum}&page_size=${PAGE_SIZE}`;

      const data = await apiFetch<PaginatedResponse<Advertisement>>(url);

      setAds(prev =>
        pageNum === 1 ? data.results : [...prev, ...data.results]
      );

      setHasNext(Boolean(data.next));
    } catch (e) {
      console.error("API error:", e);
      setAds([]);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setPage(1);
    fetchAdsByTab(activeTab, 1);
  }, [activeTab, likedAds]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAdsByTab(activeTab, nextPage);
  };


  return (
    <div className="max-w-screen-xl mx-auto py-6 flex flex-col items-center">
      <div className="flex lg:flex-row flex-col justify-center lg:space-x-8 lg:border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`lg:m-0 lg:p-3 m-2 text-xl cursor-pointer font-medium ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 w-full">
        {loading ? (
          <div className="grid lg:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCard key={i} loading />
            ))}
          </div>
        ) : ads.length ? (
          <div className="grid lg:grid-cols-4 grid-cols-2 gap-4 mt-6">
            {ads.map((ad) => (
              <ProductCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">No ads found.</p>
        )}
        {!loading && hasNext && activeTab !== "favorites" && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="cursor-pointer px-6 py-3 rounded-3xl bg-[#2AAEF7] text-white font-semibold hover:bg-blue-500 transition"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
