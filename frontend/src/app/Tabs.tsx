"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiFetch } from "@/src/shared/api/base";
import { Advertisement } from "../entities/advertisment/model/types";
import { apiFetchAuth } from "../shared/api/auth.client";
import { useAuth } from "../features/context/auth-context";

const tabs = [
  { id: "recommendations", label: "Recommendations" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recently viewed" },
];

export default function TabsExample() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("recommendations");
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [likedAds, setLikedAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем лайкнутые объявления один раз
  useEffect(() => {
    if (!user) return;

    const fetchLikedAds = async () => {
      try {
        const res = await apiFetchAuth<{ results?: Advertisement[] }>(`/api/ads/liked/`);
        const adsData = res.results ?? (Array.isArray(res) ? res : []);
        setLikedAds(adsData);
      } catch (e) {
        console.error("Error loading liked ads:", e);
      }
    };

    fetchLikedAds();
  }, [user]);

  // Универсальный загрузчик по табам
  const fetchAdsByTab = async (tabId: string) => {
    setLoading(true);

    try {
      // Для Favorites не делаем запрос — берём уже загруженные лайки
      if (tabId === "favorites") {
        setAds(likedAds);
        return;
      }

      // Для Recommendations и Recent — делаем запрос
      let url = "/api/ads/";
      if (tabId === "recommendations") url = "/api/ads/?filter=recommendations";
      if (tabId === "recent") url = "/api/ads/?filter=recent";

      const data = await apiFetch<any>(url);
      setAds(data.results || data);
    } catch (e) {
      console.error("API error:", e);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем объявления при смене таба
  useEffect(() => {
    fetchAdsByTab(activeTab);
  }, [activeTab, likedAds]);

  if (!user) {
    return (
      <div className="text-center text-gray-700 p-10">
        <h2 className="text-2xl font-bold">Пожалуйста, войдите в аккаунт</h2>
      </div>
    );
  }

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
          <div className="grid lg:grid-cols-4 grid-cols-1 gap-4 mt-6">
            {ads.map((ad) => (
              <ProductCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">No ads found.</p>
        )}
      </div>
    </div>
  );
}
