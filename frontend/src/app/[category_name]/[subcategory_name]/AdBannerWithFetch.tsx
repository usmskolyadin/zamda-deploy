"use client";

import { useAds } from "@/src/features/hooks/use-ad";
import { AdBanner } from "@/src/widgets/ad";

export default function AdBannerWithFetch({ slug }: { slug: string }) {
  const { advs, loading } = useAds(slug);

  if (loading) return null;

  return <AdBanner ads={advs} height={250} />;
}