"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MAPTILER_KEY = "E79NjVBIGfDWGtSv4mOP";

interface AdMapProps {
  address: string;
}

export default function AdMap({ address }: AdMapProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(
            address
          )}.json?key=${MAPTILER_KEY}`
        );

        const data = await res.json();

        if (data.features?.length) {
          const [lng, lat] = data.features[0].center;
          setCoords([lat, lng]);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };

    fetchCoords();
  }, [address]);

  if (error) {
    return (
      <div className="mt-4 text-sm text-gray-500">
        Location could not be displayed on map
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="mt-4 h-[300px] rounded-3xl bg-gray-100 animate-pulse" />
    );
  }

  return (
  <div className="relative isolate z-0 w-full h-[300px] rounded-3xl overflow-hidden mt-4">
      <MapContainer
        center={coords}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          attribution="&copy; MapTiler"
        />
        <Marker position={coords}>
          <Popup>{address}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
