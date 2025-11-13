'use client';

import { useAuth } from '@/src/features/context/auth-context';
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

import { API_URL, apiFetch } from '@/src/shared/api/base';
import { ChevronDown } from "lucide-react";
import ImageUploader from '@/src/widgets/image-uploader/ImageUploader';
import { LatLngExpression } from 'leaflet';
import Link from 'next/link';

const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then(mod => mod.Popup),
  { ssr: false }
);
const MapClickHandler = dynamic(
  () =>
    import("@/src/widgets/map/map-click-handler").then(
      mod => mod.MapClickHandler
    ),
  { ssr: false }
);


interface Category { id: number; name: string; slug: string }
interface SubCategory { id: number; name: string; slug: string }
interface ExtraField { id: number; name: string; key: string; field_type: string; }

export default function NewAd() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [defaultIcon, setDefaultIcon] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latLng, setLatLng] = useState<LatLngExpression>([38.5816, -121.4944]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [images, setImages] = useState<File[]>([]);
  const [extraValues, setExtraValues] = useState<{ [key: string]: string }>({});
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


useEffect(() => {
  if (typeof window === "undefined") return; 
  const token = accessToken || localStorage.getItem('access_token');
  if (!token) {
    router.push('/login');
    return;
  }

  (async () => {
    try {
      const data = await apiFetchAuth('/api/categories/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(data)) setCategories(data);
      else if (Array.isArray((data as any).results)) setCategories((data as any).results);
      else setCategories([]);
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  })();
}, [accessToken, router]);

useEffect(() => {
  if (typeof window === "undefined") return;
  const token = accessToken || localStorage.getItem('access_token');
  if (!token || !selectedCategory) return;

  apiFetchAuth(`/api/subcategories/?category=${selectedCategory}`, 
  )
    .then((data) => {
      if (Array.isArray(data)) setSubcategories(data);
      else if (Array.isArray((data as any).results)) setSubcategories((data as any).results);
      else setSubcategories([]);
    })
    .catch((err) => {
      console.error(err);
      router.push('/login');
    });
}, [accessToken, selectedCategory, router]);

//   const handleExtraChange = (key: string, value: string) => {
//     setExtraValues((prev) => ({ ...prev, [key]: value }));
//   };

const handleMapClick = async (lat: number, lng: number) => {
  setLatLng([lat, lng]);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'my-nextjs-app' } }
    );
    if (!res.ok) return;

    const data: any = await res.json();
    if (data.address) {
      const { city, town, village, road, house_number } = data.address;
      const formatted = [city || town || village, road, house_number].filter(Boolean).join(', ');
      setLocation(formatted);
      setLocationInput(formatted); // синхронизируем input с картой
      setSuggestions([]); // очищаем подсказки
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
    if (!res.ok) return;

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
  if (!accessToken) { router.push('/login'); return; }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('price', price);
  formData.append('description', description);
  formData.append('subcategory_slug', selectedSubcategory); 
  formData.append('is_active', String(isActive));
  formData.append('extra', JSON.stringify(extraValues));
  formData.append('location', locationInput || location);
  console.log('selectedSubcategory:', selectedSubcategory);
  console.log('extraValues:', extraValues);
  if (images) Array.from(images).forEach(file => formData.append('images', file));

  console.log(formData)
  const res = await fetch(`${API_URL}/api/ads/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (res.ok) router.push('/listings');
  else {
    const data = await res.json();
    console.error(data);
    alert('Ошибка при создании объявления');
  }
};

  return (
<div className="w-full">
  <section className="bg-white pt-8 px-4">
    <div className="max-w-screen-xl mx-auto">
      <h1 className="text-black text-center font-bold text-4xl py-4">New ad</h1>
    </div>
  </section>

<section className="bg-white min-h-screen flex  justify-center px-4">
  <div className="text-black w-full max-w-screen-xl">
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 w-full max-w-3xl mx-auto"
    >
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
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 mt-1 w-5 pointer-events-none text-gray-900" />
        </label>

        {selectedCategory && (

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
                <option key={sub.id} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 mt-1 w-5 pointer-events-none text-gray-900" />

          </label>
        )}

        {selectedSubcategory && (
          <>
            <label className="w-full max-w-md flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Listing Title</p>
              <p className="text-gray-700 text-sm font-medium">
                Minimum length 10 symbols, max. length 30 symbols
              </p>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                minLength={10}
                maxLength={30}
                className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                required
              />
            </label>

            <label className="w-full max-w-md flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Price ($)</p>
              <p className="text-gray-700 text-sm font-medium">
                Enter only final price
              </p>
              <input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900"
                required
              />
            </label>

            <label className="w-full max-w-md flex-col flex font-semibold text-gray-800">
              <p className="font-semibold text-black text-xl">Description</p>
              <p className="text-gray-700 text-sm font-medium">
                Min. length 50, max. length 1500 symbols
              </p>
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-4 border border-black rounded-3xl mt-1 text-gray-900"
                rows={4}
                required
                minLength={50}
                maxLength={1500}
              />
            </label>


              <ImageUploader images={images} setImages={setImages} />
            <div>
              <label className="w-full max-w-md flex-col flex font-semibold text-gray-800 relative">
                <p className="font-semibold text-black text-xl">Location</p>
                <p className="text-gray-700 text-sm font-medium">Your full location for delivery etc.</p>

                <input
                  type="text"
                  placeholder="Enter location or select on map"
                  value={locationInput}
                  onChange={handleLocationChange}
                  className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2"
                  autoComplete="off"
                  required
                />

                {suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-xl mt-1 z-50 max-h-60 overflow-auto shadow-lg">
                    {suggestions.map((sug, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-200 cursor-pointer text-sm"
                        onClick={() => handleSuggestionClick(sug)}
                      >
                        {sug.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </label>

              <div className="w-full max-w-md z-20 h-60 border border-black rounded-3xl overflow-hidden mt-2">
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
            </div>
            <div>
            </div>
            <Link href={'/listings'}>
              <button
                type="submit"
                className="bg-black/50 invisible text-white rounded-3xl px-6 py-2 mt-4 hover:bg-gray-800 transition mb-4"
              >
                Back
              </button>
            </Link>
            
            <button
              type="submit"
              className="cursor-pointer bg-black text-white rounded-3xl px-6 py-2 mt-4 hover:bg-gray-800 transition mb-4"
            >
              Create Ad
            </button>
          </>
        )}
      </form>
    </div>
  </section>
</div>
  );
}
