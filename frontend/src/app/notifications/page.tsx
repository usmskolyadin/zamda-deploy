"use client"
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";
import Sidebar from "@/src/widgets/sidebar";

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
  const [loading, setLoading] = useState(true);

    
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetchAuth("/api/notifications/");
        setNotifications(data.results);;
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff]  pb-16 p-4 h-screen">
        
        <div className="max-w-screen-xl lg:flex mx-auto">
          <Sidebar />
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
                      >
                        <div className="w-full">
                            <div className="w-full flex items-center justify-between ">
                                <h1 className="text-xl text-black font-bold pr-5">{n.title}</h1>
                                <h1 className="text-sm  text-gray-500">{new Date(n.created_at).toLocaleString()}</h1>
                            </div>
                            <div className="flex">
                                <p className="text-md font-medium text-gray-800 mr-2">{n.message}</p>
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
