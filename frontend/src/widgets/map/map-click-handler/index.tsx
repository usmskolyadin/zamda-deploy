"use client";

import { useMapEvents } from "react-leaflet";

interface MapClickProps {
  onClick: (lat: number, lng: number) => void;
}

export function MapClickHandler({ onClick }: MapClickProps) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
