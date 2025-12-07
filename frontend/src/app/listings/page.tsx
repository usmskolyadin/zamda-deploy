"use client"

import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { apiFetch } from "@/src/shared/api/base";
import { Profile } from "../profile/[id]/page";

export default function Listings() {
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useAuth();
  const [adsCount, setAdsCount] = useState(0);
  const [ads, setAds] = useState<Advertisement[]>([]);  
  const profileId = user?.profile.id
  console.log(`dsaksdakaos ${profileId}`)
  const [profile, setProfile] = useState()
  
  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      const res = await apiFetch(`/api/profiles/${profileId}/`);
      setProfile(res);
    };

    fetchProfile();
  }, [profileId]);


  console.log(user)
    useEffect(() => {
    if (!user) return;

    const fetchAds = async () => {
        const query = `owner_username=${user.username}`; 
        const res = await apiFetch<{ results: Advertisement[] }>(`/api/ads/?${query}`);
        setAds(res.results);
        setAdsCount(res.results.length);
    };
    fetchAds();
    }, [user]);

  function formatTimeLeft(seconds: number) {
    if (seconds <= 0) return "Expired";

    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d`;
  }

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff]  pb-16 p-4">
        
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/4">
            <div className="max-w-[712px]">
                  <div className="flex-col items-center justify-between lg:border-b border-gray-300 py-3">
                    <img
                        src={user?.profile.avatar}
                        width={200}
                        height={200}
                        alt="GT Logo"
                        className="lg:w-18 w-22 lg:h-18 h-22 rounded-full object-cover border border-gray-500"
                    />
                    <div>
                    <div className="py-2">
                        <h2 className="text-black font-bold lg:text-2xl text-3xl ">{user?.first_name} {user?.last_name}</h2>
                        <h2 className="text-gray-800 font-medium  text-md">{user?.username}</h2>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-1 text-black text-lg font-bold">
                          {profile?.rating ?? "—"}
                        </span>
                        <div className="flex text-yellow-400 mr-1">
                        {[...Array(4)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                        <FaStar className="opacity-50" />
                        </div>
                        <Link className="hover:underline text-[#2AAEF7] " href={`/reviews/${profile?.id ?? 0}`}>
                          <span className="text-lg ml-1">
                            {profile?.reviews_count ?? 0} reviews
                          </span>
                        </Link> 
                    </div>
                    <div className="lg:hidden block py-4">
                      <Link href={"/new"}>
                        <button className="w-full p-4 bg-blue-500 rounded-2xl cursor-pointer hover:bg-green-500 transition ">Place an ad</button>
                      </Link>
                      <Link href={"/profile/edit"}>
                        <button className="w-full mt-2 p-4 bg-[#36B731] rounded-2xl cursor-pointer hover:bg-green-500 transition ">Edit profile</button>
                      </Link>
                    </div>
                    </div>
                </div>
            </div>
            <div className="lg:block hidden">
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link href="/listings"><span className="text-[#2AAEF7] text-md h-12">My Listings</span> </Link>
                    <Link href="/favorites"><span className="text-[#2AAEF7] text-md h-12">Favorites</span></Link>
                    <Link href="/messages"><span className="text-[#2AAEF7] text-md h-12">Messages</span></Link>
                    <Link href={`/reviews/${user?.profile.id}`}><span className="text-[#2AAEF7] text-md h-12">My Reviews</span> </Link>
                </div>
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link aria-disabled href=""><span className="text-[#2AAEF7] text-md h-12">Wallet (Soon)</span> </Link>
                    <Link aria-disabled href=""><span className="text-[#2AAEF7] text-md h-12">Paid services (Soon)</span></Link>
                </div>
                <div className="py-3 flex flex-col mb-4">
                    <Link href="/profile/edit/"><span className="text-[#2AAEF7] text-md h-12">Profile settings</span> </Link>
                </div>
            </div>
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[500px] lg:flex hidden  flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
          </div>
          <div className=" lg:w-3/4 lg:ml-24">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px]  flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">My Listings</h1>
            </div>
                  <div className="flex border-b mb-4">
                    <button
                    className={`cursor-pointer text-lg font-bold mr-6 pb-2 ${
                        activeTab === "active"
                        ? "text-black border-b-4 border-black"
                        : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("active")}
                    >
                    Active Listings <sup className="text-xs font-medium">{adsCount}</sup>
                    </button>

                    <button
                    className={`cursor-pointer text-lg font-bold pb-2 ${
                        activeTab === "archived"
                        ? "text-black border-b-4 border-black"
                        : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("archived")}
                    >
                    Archived <sup className="text-xs font-medium">0</sup>
                    </button>
                </div>
                <div className="flex items-center cursor-pointer">
                    <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <path d="M14 10H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 14H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 18H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 6H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 10V20M19 20L22 17M19 20L16 17" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                    </svg>
                    <p className="text-[#333333] mr-2">Sort by</p>
                    <svg width="17" height="10" viewBox="0 0 17 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.5" d="M1.45898 0.708984L8.70888 7.95889L15.9588 0.708984" stroke="#333333" strokeWidth="2"/>
                    </svg>
                </div>
                <div>
            </div>
            <div className={`flex flex-col ${activeTab == "archived" ? "hidden" : ""}`}>
               {ads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <img
                    src="/not_found.png" 
                    alt="No ads available"
                    className="w-86 h-86 object-contain"
                  />
                    <p className="text-black text-3xl font-bold text-center">
                      So far you do not have any ads.
                    </p>
                    <p className="text-black text-xl font-medium text-center mt-2">
                      You can always create your own ad.
                    </p>

                </div>
              ) : (
                ads.map((ad) => (
                <Link key={ad.id} href={`/${ad.category_slug}/${ad.subcategory}/${ad.slug}`}>
                    <div className="lg:flex mt-4 min-w-full hover:opacity-70 transition bg-gray-100 rounded-2xl p-2">
                        <div className="mr-4 flex-shrink-0">
                            <img
                            src={ad.images[0]?.image}
                            alt={ad.title}
                            className="rounded-2xl lg:h-48 lg:w-72 w-full object-cover"
                            width={288}
                            height={192}
                            />
                        </div>
                        <div className="w-full lg:mr-4 lg:mt-0 mt-4 flex flex-col">
                            <div className="w-full flex items-center justify-between">
                            <h1 className="text-xl text-black font-bold truncate pr-2">
                                {ad.title}
                            </h1>
                            <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                                {new Date(ad.created_at).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                })}
                            </span>
                            </div>

                            <div className="flex w-full items-center mt-1">
                            <p className="text-lg text-gray-900 font-semibold mr-2">${ad.price}</p>

                            </div>

                            <p className="text-md text-gray-900 mt-2 line-clamp-3 break-all overflow-hidden">
                                {ad.description}
                            </p>
                            <p className="mt-2 text-black font-medium text-md">
                              Times left: {formatTimeLeft(ad.time_left)} 
                              
                              <span className="cursor-pointer relative group z-50 ml-1.5 p-1.5 bg-gray-300 rounded-full px-2.5 text-xs cursor-default">
                                  ?
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap 
                                                  px-2.5 py-1.5 bg-black text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 
                                                  transition pointer-events-none">
                                          After 30 days, your ad will be moved to the archive. You will need to republish it after that.
                                  </span>
                                </span>

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
                )))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
