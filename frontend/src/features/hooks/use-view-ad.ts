"use client";
import { useEffect, useState } from "react";
import { API_URL } from "@/src/shared/api/base";

export function useViewAd(adSlug?: string) {
  const [viewsCount, setViewsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!adSlug) return;

    const registerView = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ads/${adSlug}/view/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          setViewsCount(data.views_count);
        } else {
          console.warn("View not counted:", data?.detail || data);
        }
      } catch (err) {
        console.error("Failed to register view:", err);
      }
    };

    registerView();
  }, [adSlug]);

  return { viewsCount };
}
