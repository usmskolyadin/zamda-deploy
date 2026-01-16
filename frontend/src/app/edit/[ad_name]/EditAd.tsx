'use client';

import { useAuth } from '@/src/features/context/auth-context';
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { API_URL, apiFetch } from '@/src/shared/api/base';
import { ChevronDown } from "lucide-react";
import ImageUploader from '@/src/widgets/image-uploader/ImageUploader';
import { LatLngExpression } from 'leaflet';
import Link from 'next/link';
import { Advertisement } from '@/src/entities/advertisment/model/types';

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const MapClickHandler = dynamic(() => import("@/src/widgets/map/map-click-handler").then(mod => mod.MapClickHandler), { ssr: false });

interface Category { id: number; name: string; slug: string }
interface SubCategory { id: number; name: string; slug: string }
interface ExtraField { id: number; name: string; key: string; field_type: string; }
interface Ad {
  id: number;
  title: string;
  price: string;
  description: string;
  location: string;
  subcategory: { id: number; slug: string; category: { slug: string } };
  images: { id: number; image: string }[];
  lat?: number;
  lng?: number;
}
type ExistingImage = { id: number; url: string };

export default function EditAd() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const adId = params?.ad_name; // URL: /ads/edit/[id]

  const [defaultIcon, setDefaultIcon] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latLng, setLatLng] = useState<LatLngExpression>([38.5816, -121.4944]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [locationInput, setLocationInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [extraFields, setExtraFields] = useState<any[]>([]);
  const [extraValues, setExtraValues] = useState<{ [key: string]: any }>({});
  const [newImages, setNewImages] = useState<File[]>([]); // только что выбранные файлы

  
  useEffect(() => {
    setIsClient(true);
  }, []);

const maptilerStyles = {
  openstreetmap: "openstreetmap",
  streets: "streets",
  basic: "basic",
  bright: "bright",
  pastel: "pastel",
  topo: "topo",
  satellite: "satellite",
  hybrid: "hybrid",
  dark: "darkmatter",
  light: "dataviz",
  winter: "winter",
};

const MAPTILER_KEY = "E79NjVBIGfDWGtSv4mOP";

const [mapStyle, setMapStyle] = useState("openstreetmap");
  useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });
      setDefaultIcon(L.icon({
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
        iconAnchor: [12, 41],
      }));
    })();
  }, []);

  useEffect(() => {
    apiFetchAuth('/api/categories/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((data) => setCategories(Array.isArray(data) ? data : (data.results || [])))
      .catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCategory) return;
    apiFetchAuth(`/api/subcategories/?category=${selectedCategory}`)
      .then((data) => setSubcategories(Array.isArray(data) ? data : (data.results || [])))
      .catch(console.error);
  }, [selectedCategory]);

  useEffect(() => {
    if (!adId || !accessToken) return;

    setLoading(true);

    (async () => {
    try {
      const ad: Advertisement = await apiFetch<Advertisement>(`/api/ads/${params.ad_name}/`);
      
      setTitle(ad.title);
      setPrice(ad.price);
      setDescription(ad.description);
      setLocation(ad.location);
      setLocationInput(ad.location);
      setSelectedCategory(ad.category_slug);
      setSelectedSubcategory(ad.subcategory);

      const extras: { [key: string]: any } = {};
      ad.extra_values?.forEach((ef) => {
        extras[ef.field_key] = ef.value;
      });
      setExtraValues(extras);

      setExistingImages(ad.images.map(img => ({ id: img.id, url: img.image })));
      if (ad.lat && ad.lng) setLatLng([ad.lat, ad.lng]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  })();
}, [adId, accessToken, router]);

useEffect(() => {
  if (!selectedSubcategory) return;

  fetch(`${API_URL}/api/field-definitions/?subcategory__slug=${selectedSubcategory}`)
    .then((r) => r.json())
    .then((fieldsData) =>
      setExtraFields(Array.isArray(fieldsData) ? fieldsData : fieldsData.results || [])
    )
    .catch(console.error);
}, [selectedSubcategory]);

const handleMapClick = async (lat: number, lng: number) => {
  setLatLng([lat, lng]);

  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&language=en`
    );
    const data = await res.json();

    if (data?.features?.length) {
      const place = data.features[0];
      const formatted = place.place_name || place.text;

      setLocation(formatted);
      setLocationInput(formatted);
      setSuggestions([]);
    }
  } catch (err) {
    console.error("MapTiler reverse geocoding error:", err);
  }
};

const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setLocationInput(value);

  if (value.length < 3) {
    setSuggestions([]);
    return;
  }

  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(
        value
      )}.json?key=${MAPTILER_KEY}&language=en`
    );
    const data = await res.json();

    if (data?.features) {
      setSuggestions(data.features);
    }
  } catch (err) {
    console.error("MapTiler forward geocoding error:", err);
  }
};
  const handleSuggestionClick = (suggestion: any) => {
    const { lat, lon, display_name } = suggestion;
    setLatLng([parseFloat(lat), parseFloat(lon)]);
    setLocation(display_name);
    setLocationInput(display_name);
    setSuggestions([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || !adId) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('is_active', String(isActive));
    formData.append('location', locationInput || location);
    formData.append('extra', JSON.stringify(extraValues));

    newImages.forEach(file => formData.append('images', file));

    formData.append('existing_ids', JSON.stringify(existingImages.map(img => img.id)));

    const res = await fetch(`${API_URL}/api/ads/${adId}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      router.push('/listings');
    } else {
      const data = await res.json();
      console.error(data);
      alert('Error :(');
    }
  };


  if (loading) return <div className="text-center p-10 text-gray-900 h-screen bg-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="w-full">
      <section className="bg-white pt-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-black text-center font-bold text-4xl py-4">Edit Ad</h1>
        </div>
      </section>

      <section className="bg-white min-h-screen flex justify-center px-4">
        <div className="text-black w-full max-w-screen-xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 w-full max-w-3xl mx-auto">
            <label className="w-full flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Title</p>
              <p className="text-gray-700 text-sm font-medium">
                Minimum length 5 symbols, max. length 30 symbols
              </p>
              <input type="text" min={5} max={30} value={title} onChange={(e) => setTitle(e.target.value)}
                     className="p-4 border border-black rounded-3xl mt-1 text-gray-900" required />
            </label>

            <label className="w-full flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Price ($)</p>
              <p className="text-gray-700 text-sm font-medium">
                Enter only final price
              </p>
              <input type="number" min={1} max={9999999} value={price} onChange={(e) => setPrice(e.target.value)}
                     className="p-4 border border-black rounded-3xl mt-1 text-gray-900" required />
            </label>

            <label className="w-full flex-col flex font-semibold text-gray-800 col-span-2">
              <p className="font-semibold text-black text-xl">Description</p>
              <p className="text-gray-700 text-sm font-medium">
                Min. length 5, max. length 1500 symbols
              </p>
              <textarea value={description} minLength={5} maxLength={1500} onChange={(e) => setDescription(e.target.value)}
                        className="p-4 border border-black rounded-3xl mt-1 text-gray-900" rows={5} required />
            </label>

            <div className="col-span-2">
              <ImageUploader
                existingImages={existingImages}
                setExistingImages={setExistingImages}
                newImages={newImages}
                setNewImages={setNewImages}
              />
            </div>
             {extraFields.length > 0 && (
              <div className="grid lg:grid-cols-2 sm:grid-cols-2 gap-4 col-span-2">
                          {extraFields.map(field => (
                <label key={field.key} className="w-full max-w-md flex-col flex font-semibold text-gray-800">
                  <p className="font-semibold text-black text-xl">{field.name}{field.required ? ' *' : ''}</p>
                  
                  {field.field_type === "int" && (
                    <input
                      type="number"
                      placeholder={field.name}
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2"
                      onChange={e =>
                        setExtraValues(v => ({ ...v, [field.key]: Number(e.target.value) }))
                      }
                      value={extraValues[field.key] || ""}
                      required={field.required}
                    />
                  )}

                  {field.field_type === "char" && (
                    <input
                      type="text"
                      placeholder={field.name}
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2"
                      onChange={e =>
                        setExtraValues(v => ({ ...v, [field.key]: e.target.value }))
                      }
                      value={extraValues[field.key] || ""}
                      required={field.required}
                    />
                  )}

                  {field.field_type === "bool" && (
                    <select
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2"
                      onChange={e =>
                        setExtraValues(v => ({ ...v, [field.key]: e.target.value === "true" }))
                      }
                      value={extraValues[field.key] || ""}
                      required={field.required}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  )}

                  {field.field_type === "date" && (
                    <input
                      type="date"
                      placeholder={field.name}
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2"
                      onChange={e =>
                        setExtraValues(v => ({ ...v, [field.key]: e.target.value }))
                      }
                      value={extraValues[field.key] || ""}
                      required={field.required}
                    />
                  )}
                  {field.field_type === "select" && field.options && (
                    <select
                      className="p-4 border border-black rounded-3xl appearance-none h-[55px] mt-1 text-gray-900 mb-2"
                      value={extraValues[field.key] ?? ""}
                      onChange={e =>
                        setExtraValues(v => ({ ...v, [field.key]: e.target.value }))
                      }
                      required={field.required}
                    >
                      <option value="">Select</option>
                      {field.options.map(opt => (
                        <option key={opt.id} value={opt.value}>
                          {opt.value}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
              </div>
            )}

            <label className="w-full  flex-col flex font-semibold text-gray-800 relative col-span-2">
              <p className="font-semibold text-black text-xl">Location</p>
              <input
                type="text"
                placeholder="Enter location"
                value={locationInput}
                onChange={handleLocationChange}
                className="p-4 border border-black rounded-3xl mt-1 text-gray-900 mb-2"
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-xl mt-1 z-50 max-h-60 overflow-auto shadow-lg">
                  {suggestions.map((sug, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(sug)}
                        className="p-2 hover:bg-gray-200 cursor-pointer text-sm">
                      {sug.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </label>

            <div className="w-full col-span-2 z-20 h-60 border border-black rounded-3xl overflow-hidden mt-2">
              {isClient && defaultIcon && (
                <MapContainer center={latLng} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url={`https://api.maptiler.com/maps/${maptilerStyles[mapStyle]}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
                  attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                  {defaultIcon && (
                    <Marker position={latLng} icon={defaultIcon}>
                      <Popup>Selected location</Popup>
                    </Marker>
                  )}

                  <MapClickHandler onClick={handleMapClick} />
                </MapContainer>
              )}
            </div>

            <div className="col-span-2 flex justify-between mt-6 mb-6">
              <Link href="/listings">
                <button type="button"
                        className="cursor-pointer bg-gray-300 text-black rounded-3xl px-6 py-2 hover:bg-gray-400 transition">
                  Cancel
                </button>
              </Link>
              <button type="submit"
                      className="cursor-pointer bg-black text-white rounded-3xl px-6 py-2 hover:bg-gray-800 transition">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
