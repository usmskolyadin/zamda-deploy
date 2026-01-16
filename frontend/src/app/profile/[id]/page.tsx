"use client";

import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { apiFetch } from "@/src/shared/api/base";

export interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  rating: number;
  reviews_count: number;
  city: string;
}

export default function Profile() {
  const params = useParams<{ id: string }>();
  const profileId = params?.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [activeTab, setActiveTab] = useState("active");

useEffect(() => {
  if (!profileId) return;

  const fetchProfile = async () => {
    const res = await apiFetch<Profile>(`/api/profiles/${Number(profileId)}/`);
    setProfile(res);
  };

  fetchProfile();
}, [profileId]);

useEffect(() => {
  if (!profile?.username) return;

  const fetchAds = async () => {
    const res = await apiFetch<{ results: Advertisement[] }>(
      `/api/ads/?owner_username=${profile.username}`
    );
    setAds(res.results);
  };

  fetchAds();
}, [profile?.username]);


  if (!profile) {
    return <p className="text-center flex text-black justify-center text-md items-center h-screen bg-white">Loading profile...</p>;
  }

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/4">
            <div className="flex-col items-center justify-between lg:border-b border-gray-300 py-3">
              <img
                src={profile.avatar}
                width={200}
                height={200}
                alt="Avatar"
                className="lg:w-18 w-22 lg:h-18 h-22 rounded-full object-cover border border-gray-500"
              />
              <div className="py-2">
                <h2 className="text-black font-bold lg:text-2xl text-3xl">
                  {profile.first_name} {profile.last_name}
                </h2>
                  {profile.city ? (
                <p className=" flex text-gray-700 font-medium items-center text-lg py-2">
                    <svg className="mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="2"/>
                            <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                    </svg>
                    {profile.city} 
                    <></>
                </p>
                  ) : (<></>
                  )}

              </div>

              <div className="flex items-center text-sm text-gray-700">
                <span className="mr-1 text-black text-lg font-bold">
                  {profile.rating ?? "—"}
                </span>
                <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(profile.rating) ? "" : "opacity-30"}
                    />
                  ))}
                </div>
                <span className="text-[#2AAEF7] text-lg ml-1">
                  <Link href={`/reviews/${profile.id}`}>All reviews</Link>
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4 lg:ml-24">
            <h1 className="text-black font-bold lg:text-3xl text-3xl py-4">
              {profile.first_name}'s Listings
            </h1>



            <div className="flex flex-col">
              {ads.map((ad) => (
                <Link key={ad.id} href={`/${ad.subcategory.slug}/${ad.subcategory.slug}/${ad.slug}`}>
                  <div className="lg:flex mt-4 min-w-full bg-gray-100 rounded-2xl lg:p-2 p-3">
                    <div className="mr-4">
                      <img
                        src={ad.images[0]?.image}
                        alt={""}
                        className="rounded-2xl lg:h-48 lg:w-72 min-w-72 h-52 w-full object-cover"
                      />
                    </div>
                    <div className="w-full lg:mt-0 mt-2">
                      <h1 className="text-xl text-black font-bold items-center w-full flex justify-between break-words leading-snug overflow-hidden">
                        {ad.title}
                        <span className="ml-2 text-gray-600 text-sm font-medium mr-4 shrink-0">
                          {new Date(ad.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </h1>

                      <p className="text-md text-gray-900 font-semibold break-words">
                        ${ad.price}
                      </p>

                      <p
                        className="text-md text-gray-600 mt-2 line-clamp-3 break-all overflow-hidden"
                      >
                        {ad.description}
                      </p>

                      <p className="font-medium flex text-gray-700 items-center text-md mt-3">
                        <svg
                          className="mr-1"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.5">
                            <path
                              d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z"
                              stroke="black"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z"
                              fill="black"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </svg>
                        {ad.location}
                      </p>
                    </div>

                  </div>
                </Link>
              ))}
              {ads.length === 0 && (
                <p className="text-gray-500 mt-4">No listings yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
