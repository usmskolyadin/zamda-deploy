"use client";

import React, { useEffect, useMemo, useState } from "react";

interface Ad {
  id: number;
  image?: string | null;
  mobile_image?: string | null;
  iframe_code?: string | null;
  link?: string | null;
  title?: string;
}

interface AdBannerProps {
  ads?: Ad[];
  height?: number;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  ads,
  height = 200,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  const ad = useMemo(() => {
    if (!ads || ads.length === 0) return null;

    return ads[0];
  }, [ads]);

  const image = useMemo(() => {
    if (!ad) return null;

    // на телефоне ТОЛЬКО mobile_image
    if (isMobile) {
      return ad.mobile_image || null;
    }

    // на компе ТОЛЬКО desktop image
    return ad.image || null;
  }, [ad, isMobile]);

  const renderPlaceholder = () => (
    <div
      className="
        rounded-3xl
        w-full
        border
        border-gray-200
        shadow-sm
        transition
        bg-gray-100
        flex
        justify-center
        items-center
      "
      style={{ height }}
    >
      <h2 className="text-[#333333] text-3xl font-bold opacity-40">
        Your Ad Here
      </h2>
    </div>
  );

  // нет рекламы
  if (!ad) {
    return renderPlaceholder();
  }

  // iframe баннер
  if (ad.iframe_code) {
    return (
      <div
        className="rounded-3xl overflow-hidden w-full"
        style={{ height }}
        dangerouslySetInnerHTML={{
          __html: ad.iframe_code,
        }}
      />
    );
  }

  // если нет нужной картинки под устройство
  if (!image) {
    return renderPlaceholder();
  }

  return (
    <a
      href={ad.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-3xl overflow-hidden w-full"
      style={{ height }}
    >
      <img
        src={image}
        alt={ad.title || "advertisement"}
        className="w-full h-full object-cover"
      />
    </a>
  );
};