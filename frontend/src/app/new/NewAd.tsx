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
export type ExtraFieldDefinition = {
  id: number;                 // ID поля в БД
  name: string;               // Название поля, например "Пробег"
  key: string;                // Ключ для передачи в extra, например "mileage"
  field_type: "char" | "int" | "float" | "bool" | "date"; // Тип поля
  required: boolean;          // Обязательное ли поле
  choices?: string[];         // Для select-полей (если используешь), опционально
};

export default function NewAd() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [defaultIcon, setDefaultIcon] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [extraFields, setExtraFields] = useState<ExtraFieldDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latLng, setLatLng] = useState<LatLngExpression>([38.5816, -121.4944]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [images, setImages] = useState<File[]>([]);
  const [extraValues, setExtraValues] = useState<Record<string, any>>({});
  const [locationInput, setLocationInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

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
type ExistingImage = { id: number; url: string };

const [errorMessage, setErrorMessage] = useState<string | null>(null); // <-- сюда ошибки
const [existingImages, setExistingImages] = useState<ExistingImage[]>([]); 
const [newImages, setNewImages] = useState<File[]>([]);

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
  if (!selectedCategory) {
    setSelectedSubcategory("");  // очищаем выбранную подкатегорию
    setExtraFields([]);          // очищаем дополнительные поля
    return;
  }

  apiFetchAuth(`/api/subcategories/?category=${selectedCategory}`)
    .then(data => setSubcategories(normalizeList(data)))
    .catch(err => {
      console.error(err);
      setSubcategories([]);
    });
}, [selectedCategory]);


const normalizeList = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

useEffect(() => {
  if (!selectedSubcategory) {
    setExtraFields([]);
    return;
  }

  const fetchExtraFields = async () => {
    try {
      const data = await apiFetchAuth(`/api/field-definitions/?subcategory__slug=${selectedSubcategory}`);
      setExtraFields(normalizeList(data));
    } catch (err) {
      console.error(err);
      setExtraFields([]);
    }
  }

  fetchExtraFields();
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

function formatBackendErrors(err: any): string {
  if (!err) return "Неизвестная ошибка";
  if (typeof err === "string") return err;

  if (typeof err === "object") {
    return Object.entries(err)
      .map(([field, msg]) => Array.isArray(msg)
        ? `${field}: ${msg.join(", ")}`
        : `${field}: ${msg}`
      )
      .join("\n");
  }

  return String(err);
}


const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setErrorMessage(null);

  const token = localStorage.getItem('access_token');
  if (!token) {
    router.push('/login');
    return;
  }

  if (!selectedSubcategory) {
    setErrorMessage('Выберите подкатегорию');
    return;
  }

  if ((existingImages?.length ?? 0) + (newImages?.length ?? 0) < 1) {
    alert("Minimum 1 image!");
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('price', price);
  formData.append('description', description);
  formData.append('subcategory_slug', selectedSubcategory);
  formData.append('is_active', String(isActive));
  formData.append('extra', JSON.stringify(extraValues));
  formData.append('location', locationInput);

  // Только новые изображения для POST
  newImages.forEach((file) => {
    formData.append('images', file, file.name);
  });

  try {
    const res = await fetch(`${API_URL}/api/ads/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      console.error(data);
      alert('Ошибка при создании объявления');
      return;
    }

    router.push('/listings');
  } catch (networkError) {
    setErrorMessage('Сетевая ошибка. Проверь соединение.');
    console.error(networkError);
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
      className="grid lg:grid-cols-2 grid-cols-1 gap-4 w-full max-w-3xl mx-auto"
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
              <div>
              <ImageUploader
                existingImages={existingImages}
                setExistingImages={setExistingImages}
                newImages={newImages}
                setNewImages={setNewImages} 
              />
                    {errorMessage && (
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                )}

              </div>
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
                      required={field.required}
                    />
                  )}

                  {field.field_type === "bool" && (
                    <select
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2"
                      onChange={e =>
                        setExtraValues(v => ({ ...v, [field.key]: e.target.value === "true" }))
                      }
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
                      required={field.required}
                    />
                  )}

                  {field.field_type === "select" && field.choices && (
                    <select
                      className="p-4 border border-black rounded-3xl h-[44px] mt-1 text-gray-900 mb-2"
                      onChange={e =>
                        setExtraValues(v => ({ ...v, [field.key]: e.target.value }))
                      }
                      required={field.required}
                    >
                      <option value="">Select</option>
                      {field.choices.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
            <div>
            </div>
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

              {isClient && defaultIcon && (
                <MapContainer center={latLng} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
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
