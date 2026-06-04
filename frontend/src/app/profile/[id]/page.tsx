"use client";

import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import VerificationBadges from "@/src/widgets/VerificationBadges";
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
  verification?: {
    google_verified: boolean;
    facebook_verified: boolean;
    phone_verified: boolean;
  } | null;
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
        <div className="max-w-screen-xl h-screen lg:flex mx-auto px-4 sm:px-6 lg:px-12">
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
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-black font-bold lg:text-2xl text-3xl">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <VerificationBadges verification={profile.verification} />
                </div>
                  {profile.city ? (
                <p className=" flex text-gray-700 font-medium items-center text-lg py-2">
                <svg className="mr-1 min-h-5 min-w-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.03125 8.91703L19.5079 4.58356C19.8834 4.47843 20.2293 4.8244 20.1242 5.19986L15.7907 20.6765C15.6641 21.1286 15.0406 21.1728 14.8516 20.7431L11.6033 13.3607C11.553 13.2462 11.4615 13.1548 11.347 13.1044L3.9647 9.85617C3.535 9.66711 3.57919 9.04361 4.03125 8.91703Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <span className="text-[#2AAEF7] cursor-pointer hover:underline text-lg ml-1">
                  <Link href={`/reviews/${profile.id}`}>All reviews</Link>
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4 lg:ml-24">
            <h1 className="text-black font-bold lg:text-3xl text-2xl py-4">
              {profile.first_name}'s Listings
            </h1>



            <div className="flex flex-col">
  {ads.map((ad) => (
    <Link
      key={ad.id}
      href={`/${ad.subcategory.slug}/${ad.subcategory.slug}/${ad.slug}`}
      className="block"
    >
      <div className="lg:flex mt-4 w-full bg-gray-100 rounded-2xl lg:p-2 p-3 gap-4">

        {/* IMAGE */}
        <div className="lg:w-[280px] w-full flex-shrink-0">
          <img
            src={ad.images[0]?.image}
            alt=""
            className="rounded-2xl h-52 lg:h-48 w-full object-cover"
          />
        </div>

        {/* CONTENT */}
        <div className="w-full min-w-0 flex flex-col">

          {/* TITLE ROW */}
          <div className="flex justify-between items-start gap-2 min-w-0">
            <h1 className="text-xl text-black font-bold break-words leading-snug min-w-0">
              {ad.title}
            </h1>

            <span className="text-gray-600 text-sm font-medium shrink-0 whitespace-nowrap">
              {new Date(ad.created_at).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {/* PRICE */}
          <p className="text-md text-gray-900 font-semibold mt-1">
            ${Number(ad.price)}
          </p>

          {/* DESCRIPTION */}
          <p className="text-md text-gray-600 mt-2 line-clamp-3">
            {ad.description}
          </p>

          {/* META */}
          <div className="flex items-center mt-2 flex-wrap gap-x-2 gap-y-1">

            {/* VIEWS */}
            <span className="text-sm text-black/80 font-medium flex items-center">
<svg className="mr-1" width="18" height="18" viewBox="0 -4 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-260.000000, -4563.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M216,4409.00052 C216,4410.14768 215.105,4411.07682 214,4411.07682 C212.895,4411.07682 212,4410.14768 212,4409.00052 C212,4407.85336 212.895,4406.92421 214,4406.92421 C215.105,4406.92421 216,4407.85336 216,4409.00052 M214,4412.9237 C211.011,4412.9237 208.195,4411.44744 206.399,4409.00052 C208.195,4406.55359 211.011,4405.0763 214,4405.0763 C216.989,4405.0763 219.805,4406.55359 221.601,4409.00052 C219.805,4411.44744 216.989,4412.9237 214,4412.9237 M214,4403 C209.724,4403 205.999,4405.41682 204,4409.00052 C205.999,4412.58422 209.724,4415 214,4415 C218.276,4415 222.001,4412.58422 224,4409.00052 C222.001,4405.41682 218.276,4403 214,4403" id="view_simple-[#815]"> </path> </g> </g> </g> </svg>
              {ad.views_count}
            </span>

            <span className="text-gray-400">•</span>

            {/* LIKES */}
            <span className="text-sm text-black/80 font-medium flex items-center">
<svg width="18" height="18" className="mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" > <path fillRule="evenodd" clipRule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> </svg>
              {ad.likes_count}
            </span>

            {/* <span className="text-gray-400">•</span>

            <span className="flex items-center text-sm text-black/80 font-medium min-w-0 max-w-full">
<svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" > <path d="M4.03125 8.91703L19.5079 4.58356C19.8834 4.47843 20.2293 4.8244 20.1242 5.19986L15.7907 20.6765C15.6641 21.1286 15.0406 21.1728 14.8516 20.7431L11.6033 13.3607C11.553 13.2462 11.4615 13.1548 11.347 13.1044L3.9647 9.85617C3.535 9.66711 3.57919 9.04361 4.03125 8.91703Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> </svg>
              <span className="truncate min-w-0 ml-1 block">
                {ad.location}
              </span>
            </span> */}

          </div>
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
