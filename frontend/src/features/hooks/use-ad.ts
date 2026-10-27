"use client";

import useSWR from "swr";
import { apiFetch } from "@/src/shared/api/base";

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

const fetcher = (url: string) => apiFetch<Ad[]>(url);

export function useAds(adSlug?: string, options?: UseAdsOptions) {
  const { fallbackSlug } = options || {};
  const slugToUse = adSlug || fallbackSlug;

  // Many unrelated components (sidebar, listings, messages, profile, ...)
  // mount at once and each ask for their own ad slot. SWR caches/dedupes by
  // key, so the same slug fetched from several places at once only hits
  // the network once, and re-mounting a page that already showed this slot
  // reuses the cached banner instead of flashing a placeholder again.
  const { data, error, isLoading } = useSWR<Ad[]>(
    slugToUse ? `/api/advertising/${slugToUse}/` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  return {
    advs: data ?? [],
    loading: isLoading,
    error: error ? error.message || "Unknown error" : null,
  };
}
