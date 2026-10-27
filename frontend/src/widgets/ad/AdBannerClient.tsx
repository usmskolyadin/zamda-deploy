"use client";

import { useAds } from "@/src/features/hooks/use-ad";
import { AdBanner } from ".";

interface Page {
    page: string
    height?: number
    desktopHeight?: number
}

export default function AdsBlock({page, height, desktopHeight}: Page) {
  const { advs } = useAds(page);

  return <AdBanner ads={advs} height={height} desktopHeight={desktopHeight} />;
}