"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";
import LocationMap from "../location-map/LocationMap";

interface SubCategory {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
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
}

export default function Filters({ initialSubcategory, categorySlug}: FiltersProps) {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [subcategory, setSubcategory] = useState(initialSubcategory || "");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [location, setLocation] = useState("");
  const [freshness, setFreshness] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [extraFields, setExtraFields] = useState<ExtraFieldDefinition[]>([]);
  const [extraValues, setExtraValues] = useState<Record<string, string | number | boolean>>({});

  const router = useRouter();

  useEffect(() => {
    const url = categorySlug
      ? `${API_URL}/api/subcategories/?category=${categorySlug}`
      : `${API_URL}/api/subcategories/`;

    fetch(url)
      .then(r => r.json())
      .then(d => setSubcategories(Array.isArray(d) ? d : d.results || []))
      .catch(() => setSubcategories([]));
  }, [categorySlug]);

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

    if (subcategory) params.append("subcategory", subcategory);
    if (priceFrom) params.append("price_min", priceFrom);
    if (priceTo) params.append("price_max", priceTo);
    if (location) params.append("location", location);
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
              subcategories={subcategories}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              priceFrom={priceFrom}
              setPriceFrom={setPriceFrom}
              priceTo={priceTo}
              setPriceTo={setPriceTo}
              location={location}
              setLocation={setLocation}
              extraFields={extraFields}
              extraValues={extraValues}
              setExtraValues={setExtraValues}
              handleShow={handleShow}
            />
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden z-50 bg-[#2AAEF7] w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
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
              subcategories={subcategories}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              priceFrom={priceFrom}
              setPriceFrom={setPriceFrom}
              priceTo={priceTo}
              setPriceTo={setPriceTo}
              location={location}
              setLocation={setLocation}
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
  subcategories: SubCategory[];
  subcategory: string;
  setSubcategory: (v: string) => void;
  priceFrom: string;
  setPriceFrom: (v: string) => void;
  priceTo: string;
  setPriceTo: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  extraFields: ExtraFieldDefinition[];
  extraValues: Record<string, any>;
  setExtraValues: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  handleShow: () => void;
};

function FiltersBody({
  subcategories,
  subcategory,
  setSubcategory,
  priceFrom,
  setPriceFrom,
  priceTo,
  setPriceTo,
  location,
  setLocation,
  extraFields,
  extraValues,
  setExtraValues,
  handleShow,
}: FiltersBodyProps) {
  return (
  <div className=" w-full p-4 bg-white rounded-3xl">
  <h1 className="text-black font-bold text-3xl py-4">Filters</h1>

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
    <label className="flex flex-col w-full">
      <span className="text-black font-semibold text-xl mb-2">Location</span>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="px-4 py-2 border-0.5 border text-gray-900 border-black rounded-3xl"
        placeholder="City, region..."
      />
    </label>
      <LocationMap location={location} />

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

  <div className="rounded-3xl w-full bg-[#F2F1F0] h-48 mt-6 flex justify-center items-center">
    <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
  </div>
</div>

)};