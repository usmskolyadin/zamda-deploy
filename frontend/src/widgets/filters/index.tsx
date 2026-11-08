"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";
import { useAuth } from "@/src/features/context/auth-context";
import LocationMap from "../location-map/LocationMap";
import AdsBlock from "../ad/AdBannerClient";
import StickyAdBlock from "../ad/StickyBanner";

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  category: {
    id: number;
    name: string;
  };
}

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export type ExtraFieldDefinition = {
  id: number;
  name: string;
  key: string;
  field_type: "char" | "int" | "float" | "bool" | "date" | "select";
  options?: { id: number; value: string }[]; 
  required: boolean;
};

interface FiltersProps {
  initialSubcategory?: string;
  categorySlug?: string;
  mobileTitle?: string;
}

export default function Filters({ initialSubcategory, categorySlug, mobileTitle }: FiltersProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [category, setCategory] = useState(categorySlug || "");
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [subcategory, setSubcategory] = useState(initialSubcategory || "");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("");
  const [customRadius, setCustomRadius] = useState("50");
  const [freshness, setFreshness] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [extraFields, setExtraFields] = useState<ExtraFieldDefinition[]>([]);
  const [extraValues, setExtraValues] = useState<Record<string, string | number | boolean>>({});

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!location && user?.profile?.city) {
      setLocation(user.profile.city);
    }
  }, [user]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories/`)
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : d.results || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const url = category
      ? `${API_URL}/api/subcategories/?category=${category}`
      : `${API_URL}/api/subcategories/`;

    fetch(url)
      .then(r => r.json())
      .then(d => setSubcategories(Array.isArray(d) ? d : d.results || []))
      .catch(() => setSubcategories([]));
  }, [category]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory("");
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  useEffect(() => {
    if (!subcategory) {
      setExtraFields([]);
      return;
    }

    fetch(`${API_URL}/api/field-definitions/?subcategory__slug=${subcategory}`)
      .then(res => res.json())
      .then(data => setExtraFields(Array.isArray(data) ? data : data.results || []))
      .catch(() => setExtraFields([]));
  }, [subcategory]);

  const handleShow = () => {
    const params = new URLSearchParams();

    if (category) params.append("category", category);
    if (subcategory) params.append("subcategory", subcategory);
    if (priceFrom) params.append("price_min", priceFrom);
    if (priceTo) params.append("price_max", priceTo);
    if (location) params.append("location", location);
    if (radius === "custom" && customRadius) {
      params.append("radius", customRadius);
    } else if (radius) {
      params.append("radius", radius);
    }
    if (freshness) {
      const date = new Date();
      date.setDate(date.getDate() - Number(freshness));
      params.append("created_after", date.toISOString());
    }

    const extraParams: string[] = [];
    Object.entries(extraValues).forEach(([key, value]) => {
      if (value !== "" && value != null) {
        extraParams.push(`${key}:${value}`);
      }
    });
    if (extraParams.length > 0) {
      params.append("extra", extraParams.join(","));
    }

    setMobileOpen(false);
    router.push(`/search?${params.toString()}`);
  };



  return (
    <>
      <div className="hidden lg:block mr-2">
            <FiltersBody
              categories={categories}
              category={category}
              setCategory={handleCategoryChange}
              subcategories={subcategories}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              priceFrom={priceFrom}
              setPriceFrom={setPriceFrom}
              priceTo={priceTo}
              setPriceTo={setPriceTo}
              location={location}
              setLocation={setLocation}
              radius={radius}
              setRadius={setRadius}
              customRadius={customRadius}
              setCustomRadius={setCustomRadius}
              extraFields={extraFields}
              extraValues={extraValues}
              setExtraValues={setExtraValues}
              handleShow={handleShow}
            />
      </div>

      <div className="lg:hidden flex items-center justify-between gap-3">
        {mobileTitle && (
          <h1 className="text-black font-bold text-2xl truncate">{mobileTitle}</h1>
        )}

        <button
          onClick={() => setMobileOpen(true)}
          className="flex-shrink-0 z-30 bg-[#2AAEF7] w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
        >
          <svg
            width="26"
            height="26"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M3 6h20M6 13h14M10 20h6" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40">
          <div className="absolute inset-0 bg-white overflow-y-auto p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-3xl text-black"
            >
              ×
            </button>
            <FiltersBody
              categories={categories}
              category={category}
              setCategory={handleCategoryChange}
              subcategories={subcategories}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              priceFrom={priceFrom}
              setPriceFrom={setPriceFrom}
              priceTo={priceTo}
              setPriceTo={setPriceTo}
              location={location}
              setLocation={setLocation}
              radius={radius}
              setRadius={setRadius}
              customRadius={customRadius}
              setCustomRadius={setCustomRadius}
              extraFields={extraFields}
              extraValues={extraValues}
              setExtraValues={setExtraValues}
              handleShow={handleShow}
            />
          </div>
        </div>
      )}
    </>
  );
}


type FiltersBodyProps = {
  categories: CategoryOption[];
  category: string;
  setCategory: (v: string) => void;
  subcategories: SubCategory[];
  subcategory: string;
  setSubcategory: (v: string) => void;
  priceFrom: string;
  setPriceFrom: (v: string) => void;
  priceTo: string;
  setPriceTo: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  radius: string;
  setRadius: (v: string) => void;
  customRadius: string;
  setCustomRadius: (v: string) => void;
  extraFields: ExtraFieldDefinition[];
  extraValues: Record<string, any>;
  setExtraValues: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  handleShow: () => void;
};

function FiltersBody({
  categories,
  category,
  setCategory,
  subcategories,
  subcategory,
  setSubcategory,
  priceFrom,
  setPriceFrom,
  priceTo,
  setPriceTo,
  location,
  setLocation,
  radius,
  setRadius,
  customRadius,
  setCustomRadius,
  extraFields,
  extraValues,
  setExtraValues,
  handleShow,
}: FiltersBodyProps) {
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const MAPTILER_KEY = "E79NjVBIGfDWGtSv4mOP";

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=${MAPTILER_KEY}&language=en`
      );
      const data = await res.json();

      if (data?.features) {
        setLocationSuggestions(data.features);
      }
    } catch (err) {
      console.error("MapTiler forward geocoding error:", err);
    }
  };

  const handleLocationSuggestionClick = (suggestion: any) => {
    setLocation(suggestion.place_name || suggestion.text);
    setLocationSuggestions([]);
  };

  return (
  <div className=" w-full pr-8 bg-white rounded-3xl">
  <h1 className="text-black font-bold text-3xl py-4">Filters</h1>

  <div className="mb-4">
    <label className="flex flex-col w-full">
      <span className="text-black font-semibold text-xl mb-2">Category</span>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="cursor-pointer px-4 py-3 border-0.5 border text-gray-900 border-black rounded-3xl appearance-none"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
    </label>
  </div>

  <div className="mb-4">
    <label className="flex flex-col w-full">
      <span className="text-black font-semibold text-xl mb-2">Subcategory</span>
      <select
        value={subcategory}
        onChange={(e) => setSubcategory(e.target.value)}
        className="cursor-pointer px-4 py-3 border-0.5 border text-gray-900 border-black rounded-3xl appearance-none"
      >
        <option value="">Select subcategory</option>
        {subcategories.map((sub) => (
          <option key={sub.id} value={sub.slug}>
            {sub.name}
          </option>
        ))}
      </select>
    </label>
  </div>

  <div className="mb-4">
    <span className="text-black font-semibold text-xl mb-2 block">Price</span>
    <div className="flex gap-2">
      <input
        type="number"
        value={priceFrom}
        onChange={(e) => setPriceFrom(e.target.value)}
        className="px-4 py-2 w-1/2 border-0.5 border text-gray-900 border-black rounded-3xl"
        placeholder="From"
      />
      <input
        type="number"
        value={priceTo}
        onChange={(e) => setPriceTo(e.target.value)}
        className="px-4 py-2 w-1/2 border-0.5 border text-gray-900 border-black rounded-3xl"
        placeholder="To"
      />
    </div>
  </div>

  <div className="mb-4">
    <label className="flex flex-col w-full relative z-30">
      <span className="text-black font-semibold text-xl mb-2">Location</span>
      <input
        type="text"
        value={location}
        onChange={handleLocationChange}
        className="px-4 py-2 border-0.5 border text-gray-900 border-black rounded-3xl"
        placeholder="City, region..."
        autoComplete="off"
      />

      {locationSuggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-xl mt-1 z-[9999] max-h-60 overflow-auto shadow-lg">
          {locationSuggestions.map((sug, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer text-sm text-gray-900"
              onClick={() => handleLocationSuggestionClick(sug)}
            >
              {sug.place_name || sug.text}
            </li>
          ))}
        </ul>
      )}
    </label>

    <div className="mt-3">
      <span className="text-black font-semibold text-base mb-2 block">Search radius</span>
      <div className="flex flex-wrap gap-2 mb-2">
        {[
          { label: "1 mi", value: "1" },
          { label: "5 mi", value: "5" },
          { label: "10 mi", value: "10" },
          { label: "20 mi", value: "20" },
          { label: "60 mi", value: "60" },
          { label: "100 mi", value: "100" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRadius(opt.value === radius ? "" : opt.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition cursor-pointer ${
              radius === opt.value
                ? "bg-[#2AAEF7] text-white border-[#2AAEF7]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#2AAEF7]"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setRadius(radius === "custom" ? "" : "custom")}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition cursor-pointer ${
            radius === "custom"
              ? "bg-[#2AAEF7] text-white border-[#2AAEF7]"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#2AAEF7]"
          }`}
        >
          Custom
        </button>
      </div>
      {radius === "custom" && (
        <div className="mt-2">
          <input
            type="range"
            min="1"
            max="500"
            value={customRadius}
            onChange={(e) => setCustomRadius(e.target.value)}
            className="w-full accent-[#2AAEF7]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 mi</span>
            <span className="font-semibold text-black">{customRadius} mi</span>
            <span>500 mi</span>
          </div>
        </div>
      )}
    </div>

    <LocationMap location={location} radius={radius === "custom" ? customRadius : radius} />

  </div>

  {extraFields.length > 0 && (
    <div className="mb-4">
      <div className="grid lg:grid-cols-2 sm:grid-cols-2 gap-4">
        {extraFields.map((field) => (
          <label key={field.key} className="flex flex-col w-full">
            <span className="font-semibold text-black text-xl mb-2">{field.name}</span>

            {field.field_type === "int" && (
              <input
                type="number"
                min={0}
                placeholder={field.name}
                value={extraValues[field.key] || ""}
                onChange={(e) =>
                  setExtraValues((v) => ({ ...v, [field.key]: Number(e.target.value) }))
                }
                className="px-4 py-2 border-0.5 border text-gray-900 border-black rounded-3xl"
              />
            )}

            {field.field_type === "char" && (
              <input
                type="text"
                placeholder={field.name}
                value={extraValues[field.key] || ""}
                onChange={(e) =>
                  setExtraValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                className="px-4 py-2 border-0.5 border text-gray-900 border-black rounded-3xl"
              />
            )}
          {field.field_type === "select" && field.options && field.options.length > 0 && (
            <select
              value={extraValues[field.key] || ""}
              onChange={(e) =>
                setExtraValues((v) => ({ ...v, [field.key]: e.target.value }))
              }
              className="px-4 py-2 border-0.5 border text-gray-900 border-black rounded-3xl appearance-none"
              required={field.required}
            >
              <option value="">Select</option>
              {field.options.map((opt) => (
                <option key={opt.id} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
          )}
          </label>
        ))}
      </div>
    </div>
  )}

  <button
    onClick={handleShow}
    className="mt-4 w-full h-[44px] cursor-pointer rounded-3xl bg-[#2AAEF7] text-white font-semibold hover:bg-blue-400 transition flex items-center justify-center"
  >
    Show
  </button>
</div>

)};