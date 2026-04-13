"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetchAuth } from "@/src/shared/api/auth.client";

interface Ad {
  id: number;
  image: string;
  link: string;
  title?: string;
}

interface UseAdsOptions {
  fallbackSlug?: string;
  trackView?: boolean;
}

export function useAds(adSlug?: string, options?: UseAdsOptions) {
  const { fallbackSlug} = options || {};

  const [advs, setAdvs] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    const slugToUse = adSlug || fallbackSlug;

    if (!slugToUse || hasFetched.current) return;

    const fetchAds = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetchAuth(`/api/advertising/${slugToUse}/`);
        setAdvs(data);
      } catch (err: any) {
        console.error("Ads fetch error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
        hasFetched.current = true;
      }
    };

    fetchAds();
  }, [adSlug, fallbackSlug]);

  return {
    advs,
    loading,
    error,
  };
}