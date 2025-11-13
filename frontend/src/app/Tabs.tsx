"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiFetch } from "@/src/shared/api/base";
import { Advertisement } from "../entities/advertisment/model/types";

const tabs = [
  { id: "recommendations", label: "Recommendations" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recently viewed" },
];

export default function TabsExample() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAds = async (tabId: string) => {
    setLoading(true);
    try {
      let url = "/api/ads/";
      if (tabId === "favorites") url = "/api/ads/?filter=favorites";
      if (tabId === "recent") url = "/api/ads/?filter=recent";
      if (tabId === "recommendations") url = "/api/ads/?filter=recommendations";

      const data = await apiFetch<any>(url);
      console.log(data.results || data);

      setAds(data.results || data);
    } catch (err) {
      console.error("API error:", err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(activeTab);
  }, [activeTab]);

  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (!ads.length) return <p>No ads found.</p>;

    return (
      <div className="grid lg:grid-cols-4 grid-cols-1 gap-4 mt-6">
        {ads.map((ad: Advertisement) => (
          <ProductCard key={ad.id} ad={ad} />
        ))}
      </div>
    );
  };
  {loading
    ? Array.from({ length: 4 }).map((_, i) => <ProductCard key={i} loading />)
    : ads.map(ad => <ProductCard key={ad.id} ad={ad} />)}

  return (
    <div className="max-w-screen-xl mx-auto py-6 flex flex-col justify-center items-center">
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

      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}
