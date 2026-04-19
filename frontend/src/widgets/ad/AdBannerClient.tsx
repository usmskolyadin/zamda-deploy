"use client";

import { useAds } from "@/src/features/hooks/use-ad";
import { AdBanner } from ".";

interface Page {
    page: string
    height?: number
}

export default function AdsBlock({page, height}: Page) {
  const { advs } = useAds(page);

  return <AdBanner ads={advs} height={height} />;
}