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
  const [existingImages, setExistingImages] = useState<{ id: number; image: string }[]>([]);
  const [locationInput, setLocationInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Загружаем категории
  useEffect(() => {
    apiFetchAuth('/api/categories/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((data) => setCategories(Array.isArray(data) ? data : (data.results || [])))
      .catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!adId || !accessToken) return;
    (async () => {
      try {
        const ad: Advertisement = await apiFetch<Advertisement>(
          `/api/ads/${params.ad_name}/`
        );
        setTitle(ad.title);
        setPrice(ad.price);
        setDescription(ad.description);
        setLocation(ad.location);
        setLocationInput(ad.location);
        setSelectedSubcategory(String(ad.subcategory.id));
        setSelectedCategory(ad.subcategory.category.slug);
        if (ad.images) setExistingImages(ad.images);
        if (ad.lat && ad.lng) setLatLng([ad.lat, ad.lng]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [adId, accessToken, router]);

  // Загружаем подкатегории при смене категории
  useEffect(() => {
    if (!selectedCategory) return;
    apiFetchAuth(`/api/subcategories/?category=${selectedCategory}`)
      .then((data) => setSubcategories(Array.isArray(data) ? data : (data.results || [])))
      .catch(console.error);
  }, [selectedCategory]);

  const handleMapClick = async (lat: number, lng: number) => {
    setLatLng([lat, lng]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'my-nextjs-app' } }
      );
      const data: any = await res.json();
      if (data.address) {
        const { city, town, village, road, house_number } = data.address;
        const formatted = [city || town || village, road, house_number].filter(Boolean).join(', ');
        setLocation(formatted);
        setLocationInput(formatted);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`,
        { headers: { 'User-Agent': 'my-nextjs-app' } }
      );
      const data: any[] = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Geocoding error:', err);
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
    formData.append('subcategory_id', selectedSubcategory);
    formData.append('is_active', String(isActive));
    formData.append('location', locationInput || location);
    if (images) Array.from(images).forEach(file => formData.append('images', file));

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
      alert('Ошибка при обновлении объявления');
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-600">Loading...</div>;

  return (
    <div className="w-full">
      <section className="bg-white pt-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-black text-center font-bold text-4xl py-4">Edit Ad</h1>
        </div>
      </section>

      <section className="bg-white min-h-screen flex justify-center px-4">
        <div className="text-black w-full max-w-screen-xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 w-full max-w-3xl mx-auto">

            {/* Категории */}
            <label className="w-full max-w-md relative flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Category</p>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-4 pr-10 border border-black rounded-3xl h-[55px] mt-1 text-gray-900 appearance-none w-full"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 mt-1 w-5 pointer-events-none text-gray-900" />
            </label>

            {/* Подкатегории */}
            <label className="w-full max-w-md relative flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Subcategory</p>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="p-4 pr-10 border border-black rounded-3xl h-[55px] mt-1 text-gray-900 appearance-none w-full"
                required
              >
                <option value="">Select subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 mt-1 w-5 pointer-events-none text-gray-900" />
            </label>

            {/* Остальные поля */}
            <label className="w-full max-w-md flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Title</p>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                     className="p-4 border border-black rounded-3xl mt-1 text-gray-900" required />
            </label>

            <label className="w-full max-w-md flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Price ($)</p>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                     className="p-4 border border-black rounded-3xl mt-1 text-gray-900" required />
            </label>

            <label className="w-full max-w-md flex-col flex font-semibold text-gray-800 col-span-2">
              <p className="font-semibold text-black text-xl">Description</p>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        className="p-4 border border-black rounded-3xl mt-1 text-gray-900" rows={5} required />
            </label>

            {/* Изображения */}
            <div className="col-span-2">
              <p className="text-black font-semibold text-xl mb-2">Images</p>
              {existingImages.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {existingImages.map((img) => (
                    <img key={img.id} src={img.image} alt="Ad image"
                         className="w-28 h-28 object-cover rounded-xl border border-gray-300" />
                  ))}
                </div>
              )}
              <ImageUploader images={images} setImages={setImages} />
            </div>

            {/* Локация */}
            <label className="w-full max-w-md flex-col flex font-semibold text-gray-800 relative col-span-2">
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
              <MapContainer center={latLng} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {defaultIcon && (
                  <Marker position={latLng} icon={defaultIcon}>
                    <Popup>Selected location</Popup>
                  </Marker>
                )}
                <MapClickHandler onClick={handleMapClick} />
              </MapContainer>
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
