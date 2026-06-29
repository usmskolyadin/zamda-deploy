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
import { AdBanner } from "@/src/widgets/ad";
import { useAds } from "@/src/features/hooks/use-ad";
import LoadingScreen from "@/src/components/LoadingScreen";

export default function Favorites() {
  const { user } = useAuth();
  const [adsCount, setAdsCount] = useState(0);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { advs } = useAds("favorites")

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
      <LoadingScreen message="Please, login to continue" />
    );
  }
  if (isLoading) {
    return <LoadingScreen message={"Loading..."} />;
  }

  return (
    <div className="w-full">
      <section className="bg-white pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto px-4 sm:px-6 lg:px-12">
          <Sidebar />
          <div className="lg:w-3/4 lg:ml-10">
            <AdBanner ads={advs} height={250} />

            <div className="flex justify-between items-center mb-4 mt-4">
              <h1 className="text-black font-bold lg:text-4xl text-3xl">Favorites</h1>
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
                    <div className="lg:flex mt-4 min-w-full hover:opacity-70 transition border  border-gray-200
                          shadow-sm
                          transition
                          bg-gray-100 rounded-2xl ">
                        <div className="lg:mr-4 flex-shrink-0">
                            <img
                            src={ad.images[0]?.image}
                            alt={ad.title}
                            className="rounded-2xl lg:h-48 lg:w-72 min-h-48 max-h-52 w-full object-cover"
                            width={288}
                            height={192}
                            />
                        </div>
                        <div className="w-full lg:mr-4 lg:mt-0 mt-4 flex flex-col lg:p-2 px-4 py-3">
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
                            <p className="text-lg text-gray-900 font-semibold mr-2">${Number(ad.price)}</p>

                            </div>

                            <p className="text-md text-gray-600 mt-2 line-clamp-3 whitespace-pre-wrap break-words overflow-hidden">
                                {ad.description}
                            </p>
                            <div className="flex justify-between w-1/3 mt-2">
                            <div className="flex items-center">
                              <svg className="mr-1" width="22" height="22" viewBox="0 -4 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                  <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                      <g id="Dribbble-Light-Preview" transform="translate(-260.000000, -4563.000000)" fill="#000000">
                                          <g id="icons" transform="translate(56.000000, 160.000000)">
                                              <path d="M216,4409.00052 C216,4410.14768 215.105,4411.07682 214,4411.07682 C212.895,4411.07682 212,4410.14768 212,4409.00052 C212,4407.85336 212.895,4406.92421 214,4406.92421 C215.105,4406.92421 216,4407.85336 216,4409.00052 M214,4412.9237 C211.011,4412.9237 208.195,4411.44744 206.399,4409.00052 C208.195,4406.55359 211.011,4405.0763 214,4405.0763 C216.989,4405.0763 219.805,4406.55359 221.601,4409.00052 C219.805,4411.44744 216.989,4412.9237 214,4412.9237 M214,4403 C209.724,4403 205.999,4405.41682 204,4409.00052 C205.999,4412.58422 209.724,4415 214,4415 C218.276,4415 222.001,4412.58422 224,4409.00052 C222.001,4405.41682 218.276,4403 214,4403" id="view_simple-[#815]">
                                            </path>
                                          </g>
                                      </g>
                                  </g>
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
