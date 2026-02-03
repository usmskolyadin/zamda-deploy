"use client";

import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { apiFetch } from "@/src/shared/api/base";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import Sidebar from "@/src/widgets/sidebar";

export default function Favorites() {
  const { user } = useAuth();
  const [adsCount, setAdsCount] = useState(0);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLikedAds = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetchAuth<{ results?: Advertisement[] }>(`/api/ads/liked/`);
        const adsData = res.results ?? (Array.isArray(res) ? res : []);
        setAds(adsData);
        setAdsCount(adsData.length);
      } catch (error) {
        console.error("Ошибка при загрузке избранных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedAds();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center text-gray-700 p-10">
        <h2 className="text-2xl font-bold">Please, login to continue</h2>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="bg-white pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <Sidebar />
          <div className="lg:w-3/4 lg:ml-24">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px] flex justify-center items-center mb-6">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h1 className="text-black font-bold text-4xl">Favorites</h1>
              <p className="text-gray-600">{adsCount} items</p>
            </div>

            {isLoading ? (
              <p className="text-gray-500 text-center py-10">Loading favorites...</p>
            ) : ads.length === 0 ? (
              <p className="text-gray-500 py-2">
                So far you don't have favorite ads.
              </p>
            ) : (
              <div className="flex flex-col">
                {ads.map((ad) => (
                <Link key={ad.id} href={`/${ad.category_slug}/${ad.subcategory}/${ad.slug}`}>
                    <div className="lg:flex mt-4 min-w-full hover:opacity-70 transition bg-gray-100 rounded-2xl p-2">
                        <div className="lg:mr-4 flex-shrink-0">
                            <img
                            src={ad.images[0]?.image}
                            alt={ad.title}
                            className="rounded-2xl lg:h-48 lg:w-72 min-h-52 max-h-52 w-full object-cover"
                            width={288}
                            height={192}
                            />
                        </div>
                        <div className="w-full lg:mr-4 lg:mt-0 mt-4 flex flex-col lg:p-0 p-2">
                            <div className="w-full flex items-center justify-between">
                            <h1 className="text-xl text-black font-bold truncate pr-2">
                                {ad.title}
                            </h1>
                            <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                                {new Date(ad.created_at).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                })}
                            </span>
                            </div>

                            <div className="flex w-full items-center mt-1">
                            <p className="text-lg text-gray-900 font-semibold mr-2">${ad.price}</p>

                            </div>

                            <p className="text-md text-gray-600 mt-2 line-clamp-3 break-all overflow-hidden">
                                {ad.description}
                            </p>
                            <div className="flex justify-between w-1/3 mt-2">
                            <div className="flex items-center">
                                <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    d="M1.6001 12.8004C5.7601 4.26706 18.2401 4.26706 22.4001 12.8004"
                                    stroke="#333333"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 17.5992C10.2327 17.5992 8.80005 16.1666 8.80005 14.3992C8.80005 12.6319 10.2327 11.1992 12 11.1992C13.7674 11.1992 15.2 12.6319 15.2 14.3992C15.2 16.1666 13.7674 17.5992 12 17.5992Z"
                                    stroke="#333333"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                </svg>
                                <p className="text-[#333333] text-md ml-2 mr-4">{ad.views_count}</p>
                            </div>
                            <div className="flex items-center">
                                <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    d="M22 8.86222C22 10.4087 21.4062 11.8941 20.3458 12.9929C17.9049 15.523 15.5374 18.1613 13.0053 20.5997C12.4249 21.1505 11.5042 21.1304 10.9488 20.5547L3.65376 12.9929C1.44875 10.7072 1.44875 7.01723 3.65376 4.73157C5.88044 2.42345 9.50794 2.42345 11.7346 4.73157L11.9998 5.00642L12.2648 4.73173C13.3324 3.6245 14.7864 3 16.3053 3C17.8242 3 19.2781 3.62444 20.3458 4.73157C21.4063 5.83045 22 7.31577 22 8.86222Z"
                                    stroke="#333333"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                </svg>
                                <p className="text-[#333333] text-md ml-2">{ad.likes_count}</p>
                            </div>
                            </div>
                        </div>
                        </div>

                </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
