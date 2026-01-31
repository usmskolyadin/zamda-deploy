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
import dynamic from "next/dynamic";

const AdMap = dynamic(() => import("@/src/widgets/ad-map/ad-map"), {
  ssr: false,
});

export default function AdPageClient({ ad }: { ad: Advertisement }) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const { isLiked, likesCount, toggleLike } = useLikeAd(ad.slug, accessToken);
  const rating = Math.min(5, Math.max(0, Math.round(ad?.owner.profile?.rating || 0)));
  const [error, setError] = useState<string | null>(null);
  const { viewsCount } = useViewAd(ad.slug);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiFetch<any>(`/api/ads/${ad.slug}/similar/`)
      .then((data) => {
        setAds(data?.results ?? []);
      })
      .catch((err) => {
        console.error("API error:", err);
        setError("Failed to load similar ads");
        setAds([]);
      })
      .finally(() => setLoading(false));
  }, [ad.slug]);

  return (
    <div className="w-full ">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2">
            <Link className="hover:underline" href="/">Home</Link> /{" "}
            <Link className="hover:underline" href={`/${ad.category_slug}`}>{ad.category_slug}</Link> {" / "}
            <Link className="hover:underline" href={`/${ad.category_slug}/${ad.subcategory}`}>{ad.subcategory}</Link> / {ad.title}
          </p>
          <div className="lg:flex">
            <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 py-1">
              {ad.title}
              <div className="flex mt-2">
                <span className="flex items-center text-black text-sm font-medium px-3 py-2 bg-gray-200 rounded-2xl mr-2">
                    <svg className="mr-1" width="18" height="18" viewBox="0 -4 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="Dribbble-Light-Preview" transform="translate(-260.000000, -4563.000000)" fill="#000000">
                                <g id="icons" transform="translate(56.000000, 160.000000)">
                                    <path d="M216,4409.00052 C216,4410.14768 215.105,4411.07682 214,4411.07682 C212.895,4411.07682 212,4410.14768 212,4409.00052 C212,4407.85336 212.895,4406.92421 214,4406.92421 C215.105,4406.92421 216,4407.85336 216,4409.00052 M214,4412.9237 C211.011,4412.9237 208.195,4411.44744 206.399,4409.00052 C208.195,4406.55359 211.011,4405.0763 214,4405.0763 C216.989,4405.0763 219.805,4406.55359 221.601,4409.00052 C219.805,4411.44744 216.989,4412.9237 214,4412.9237 M214,4403 C209.724,4403 205.999,4405.41682 204,4409.00052 C205.999,4412.58422 209.724,4415 214,4415 C218.276,4415 222.001,4412.58422 224,4409.00052 C222.001,4405.41682 218.276,4403 214,4403" id="view_simple-[#815]">

                              </path>
                                </g>
                            </g>
                        </g>
                    </svg>
                  <span className="ml-1 mr-1">{ad.views_count}</span> 
                  Views
                  </span>
                <span className="flex items-center text-black text-sm font-medium px-3 py-2 bg-gray-200 rounded-2xl">
                    <svg
                        width="18"
                        height="18"
                        className="mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="ml-1 mr-1">{ad.likes_count}</span> 
                      Likes
                  </span>
              </div>
            </h1>
            <h1 className="w-1/3 text-black font-bold lg:text-4xl text-2xl lg:py-4 py-1">
              ${ad.price}
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-2/3 lg:pr-36">

            <AdSlider ad={ad} />
            <div className="mt-8">


              <h1 className="text-xl font-semibold text-black mt-2 mb-2">
                Description
              </h1>
              <p className="text-black break-words overflow-hidden">{ad.description}</p>
              <h1 className="text-xl font-semibold text-black mt-2 mb-1">
                Location
              </h1>
              <p className="text-black mb-2">{ad.location}</p>
              <div className=" w-full mb-4">
                <AdMap
                  lat={ad.latitude}
                  lng={ad.longitude}
                  address={ad.location}
                />
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-black mt-2 mb-1">Additional Details</h2>
                {ad.extra_values && ad.extra_values.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ad.extra_values.map(field => (
                      <div key={field.field_key} className="flex flex-col">
                        <span className="font-semibold text-gray-800">{field.field_name}</span>
                        <span className="text-gray-700">{String(field.value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No additional details</p>
                )}
              </div>

              <div className="lg:hidden">
                <AdActions ad={ad} />
              </div>
              <h1 className="text-2xl font-bold text-black mt-24 mb-2">
                Similar Listings
              </h1>
                {loading && (
                  <div className="grid lg:grid-cols-3 gap-4 mt-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ProductCard key={i} loading />
                    ))}
                  </div>
                )}

                {!loading && error && (
                  <p className="text-gray-500 mt-4">{error}</p>
                )}

                {!loading && !error && ads.length === 0 && (
                  <p className="text-gray-500 mt-4">No similar listings</p>
                )}

                {!loading && !error && ads.length > 0 && (
                  <div className="grid gap-3 lg:grid-cols-3 grid-cols-1 mt-4">
                    {ads.map((similarAd) => (
                      <ProductCard key={similarAd.id} ad={similarAd} />
                    ))}
                  </div>
                )}

            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="hidden lg:block">
              <AdActions ad={ad} />
            </div>
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
