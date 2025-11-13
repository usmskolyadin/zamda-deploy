"use client"
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useAuth();
  const [adsCount, setAdsCount] = useState(0);

    
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/notifications/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const results = Array.isArray(data) ? data : data.results || [];
      setNotifications(results);
      setUnread(results.filter((n: Notification) => !n.is_read).length);
    });
}, []);


  const markAsRead = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/api/notifications/${id}/mark_as_read/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnread((prev) => prev - 1);
  };

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
                        <h2 className="text-black font-bold  lg:text-2xl text-3xl ">{user?.first_name} {user?.last_name}</h2>
                        <h2 className="text-gray-800 font-medium  text-md">{user?.username}</h2>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-1 text-black text-lg font-bold">{user?.profile.rating}</span>
                        <div className="flex text-yellow-400 mr-1">
                        {[...Array(4)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                        <FaStar className="opacity-50" />
                        </div>
                        <a href="#" className="text-[#2AAEF7] text-lg ml-1 hover:underline">
                        {user?.profile.reviews_count} reviews
                        </a>
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
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Notifications {unread > 0 && <span className="bg-[#2AAEF7] rounded-full text-white font-semibold">{unread}</span>}</h1>
            </div>
                <div>
            </div>
            <div className="flex flex-col">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-2 ">
                  <img
                    src="/not_found.png" 
                    alt="No ads available"
                    className="w-86 h-86 object-contain"
                  />
                <p className="text-black text-3xl font-semibold text-center">
                    You don't have any notifications
                  </p>
                </div>
              ) : (
              notifications.map((n) => (
                    <div
                      className="flex items-center mt-4 min-w-full bg-gray-100 rounded-2xl p-4"
                      key={n.id}
                      onClick={() => markAsRead(n.id)}>
                        <div>
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl text-black font-bold">{n.title}</h1>
                                <h1 className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</h1>
                            </div>
                            <div className="flex">
                                <p className="text-md text-gray-600 mr-2">{n.message}</p>
                            </div>
                        </div>
                    </div>
               )))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
