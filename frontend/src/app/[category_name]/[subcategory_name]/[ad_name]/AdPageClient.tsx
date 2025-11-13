"use client";
import Link from "next/link";
import { apiFetch } from "@/src/shared/api/base";
import AdSlider from "@/src/widgets/ad-slider";
import AdActions from "@/src/widgets/ad-actions";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import ProductCard from "@/src/app/ProductCard";
import { useEffect, useState } from "react";
import { useViewAd } from "@/src/features/hooks/use-view-ad";
import { useAuth } from "@/src/features/context/auth-context";
import { useLikeAd } from "@/src/features/hooks/use-like-ad";

export default function AdPageClient({ ad }: { ad: Advertisement }) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const { isLiked, likesCount, toggleLike } = useLikeAd(ad.slug, accessToken);

  const { viewsCount } = useViewAd(ad.slug);

  useEffect(() => {
    setLoading(true);
    apiFetch<any>("/api/ads/")
      .then((data) => {
        setAds(data.results || data);
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    setLoading(true);
    apiFetch<any>("/api/ads/")
      .then((data) => {
        setAds(data.results || data);
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2">
            <Link href="/">Home</Link> /{" "}
            <Link href="/">{ad.category_slug}</Link> {" "}
            <Link href="/">{ad.subcategory.name}</Link> / {ad.title}
          </p>
          <div className="lg:flex">
            <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 py-1">
              {ad.title}
            </h1>
            <h1 className="w-1/3 text-black font-bold lg:text-4xl text-2xl lg:py-4 py-1">
              ${ad.price}
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-2/3">
            <AdSlider ad={ad} />
            <div className="mt-8">
              <h1 className="text-xl font-semibold text-black mt-2 mb-2">
                Location
              </h1>
              <p className="text-black lg:w-2/3">{ad.location}</p>

              <h1 className="text-xl font-semibold text-black mt-2 mb-2">
                Description
              </h1>
              <p className="text-black lg:w-2/3 break-words overflow-hidden">{ad.description}</p>

              <h1 className="text-2xl font-bold text-black mt-24 mb-2">
                Similar Listings
              </h1>
              <div className="grid gap-3 lg:grid-cols-3 grid-cols-1 mt-4 lg:mr-36">
                {ads.map((similarAd: Advertisement) => (
                  <ProductCard key={similarAd.id} ad={similarAd} />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <AdActions ad={ad} />
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[300px] mt-6 flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">
                Your Ad Here
              </h2>
            </div>
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[400px] mt-6 flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">
                Your Ad Here
              </h2>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
