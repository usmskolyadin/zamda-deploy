"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";

interface LocationMapProps {
  location: string; // адрес
}

const MAPTILER_KEY = "E79NjVBIGfDWGtSv4mOP";

export default function LocationMap({ location }: LocationMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (!location) return;

    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${MAPTILER_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].geometry.coordinates;
          setCoords({ lat, lng });
        } else {
          setCoords(null);
        }
      })
      .catch(() => setCoords(null));
  }, [location]);

  useEffect(() => {
    if (map && coords) {
      setTimeout(() => {
        map.invalidateSize();
        map.setView([coords.lat, coords.lng], 13);
      }, 100); // небольшой таймаут для гарантии рендера
    }
  }, [map, coords]);

  if (!coords) return <div className="text-gray-500">Type location for map</div>;

  return (
    <div className="w-full h-[300px] mt-4 rounded-xl overflow-hidden border border-gray-300">
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        whenCreated={(m) => setMap(m)}
      >
        <TileLayer
          url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
        />
        <CircleMarker
          center={[coords.lat, coords.lng]}
          radius={5} 
          pathOptions={{ color: "blue", fillColor: "red", fillOpacity: 1 }}
        >
          <Popup>{location}</Popup>
        </CircleMarker>
        <Circle
          center={[coords.lat, coords.lng]}
          radius={2000}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.2 }}
        />
      </MapContainer>
    </div>
  );
}
