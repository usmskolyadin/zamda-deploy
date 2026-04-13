"use client";

import React, { useMemo } from "react";

interface Ad {
  id: number;
  image: string;
  link: string;
  title?: string;
}

interface AdBannerProps {
  ads?: Ad[];
  height?: number;
}

export const AdBanner: React.FC<AdBannerProps> = ({ ads, height = 200 }) => {
  const ad = useMemo(() => {
    if (!ads || ads.length === 0) return null;

    return ads[0];
  }, [ads]);

  if (!ad) {
    return (
      <div
        className="rounded-3xl w-full bg-[#F2F1F0] flex justify-center items-center"
        style={{ height }}
      >
        <h2 className="text-[#333333] text-3xl font-bold opacity-40">
          Your Ad Here
        </h2>
      </div>
    );
  }

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-3xl overflow-hidden w-full"
      style={{ height }}
    >
      <img
        src={ad.image || ""}
        alt={ad.title || "advertisement"}
        className="w-full h-full object-cover"
      />
    </a>
  );
};