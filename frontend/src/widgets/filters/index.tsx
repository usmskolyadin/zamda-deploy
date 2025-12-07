"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";

interface SubCategory {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
}

export default function Filters() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [subcategory, setSubcategory] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [location, setLocation] = useState("");
  const [freshness, setFreshness] = useState("");

  const router = useRouter();

    useEffect(() => {
    const fetchSubcategories = async () => {
        try {
        const res = await fetch(`${API_URL}/api/subcategories/`);
        if (!res.ok) throw new Error("Ошибка загрузки подкатегорий");
        const data = await res.json();

        if (Array.isArray(data)) {
            setSubcategories(data);
        } else if (Array.isArray(data.results)) {
            setSubcategories(data.results);
        } else {
            console.error("Неизвестный формат данных:", data);
            setSubcategories([]);
        }
        } catch (err) {
        console.error(err);
        setSubcategories([]);
        }
    };
    fetchSubcategories();
    }, []);


  const handleShow = () => {
    const params = new URLSearchParams();

    if (subcategory) params.append("subcategory", subcategory);
    if (priceFrom) params.append("price_min", priceFrom);
    if (priceTo) params.append("price_max", priceTo);
    if (location) params.append("location", location);
    if (freshness) {
      const date = new Date();
      date.setDate(date.getDate() - Number(freshness));
      params.append("created_after", date.toISOString());
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
      <div className="lg:w-1/3 w-full">
        <h1 className="text-black font-bold text-3xl py-4">Filters</h1>
        <div>

          <h1 className="text-black font-bold text-xl py-4">Price</h1>
          <div className="flex">
            <input
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="p-3 lg:w-43 w-1/2 rounded-2xl mr-2 text-black bg-[#E3E2E1]"
              placeholder="From"
            />
            <input
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="p-3 lg:w-43 w-1/2 rounded-2xl text-black bg-[#E3E2E1]"
              placeholder="To"
            />
          </div>

          {/* Location */}
          <h1 className="text-black font-bold text-xl py-4">Location</h1>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-3 lg:w-86 w-full rounded-2xl text-black bg-[#E3E2E1]"
            placeholder="City, region..."
          />

          {/* Freshness */}
          <h1 className="text-black font-bold text-xl py-4">Date Posted</h1>
          <select
            value={freshness}
            onChange={(e) => setFreshness(e.target.value)}
            className="p-3 lg:w-86 w-full rounded-2xl text-black bg-[#E3E2E1] appearance-none"
          >
            <option value="">It doesn't matter</option>
            <option value="1">Last 24h</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>

          <button
            onClick={handleShow}
            className="mt-4 bg-[#2AAEF7] cursor-pointer hover:bg-blue-300 transition rounded-4xl h-[60px] lg:w-[350px] w-full text-white flex items-center justify-center"
          >
            Show
          </button>

          <div className="rounded-3xl lg:w-86 w-full bg-[#F2F1F0] lg:h-100 h-50 mt-6 flex justify-center items-center">
            <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
          </div>
        </div>
      </div>
  );
}
