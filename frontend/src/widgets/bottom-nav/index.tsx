"use client";

import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth.client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSearch, FaHeart, FaPlusCircle, FaCommentDots, FaUser } from "react-icons/fa";


const ProfileImg = (profileImgUrl: string) => {
  return (
    <img src={profileImgUrl} className="w-12 h-12 rounded-full" alt="" />
  )
}

const tabs = [
  { id: "search", label: "Search", icon: <FaSearch className="w-5 h-5" />, href: "/search" },
  { id: "favorites", label: "Favorites", icon: <FaHeart className="w-5 h-5" />, href: "/favorites" },
  { id: "ads", label: "Place an Ad", icon: <FaPlusCircle className="w-5 h-5" />, highlight: true, href: "/new" },
  { id: "messages", label: "Messages", icon: <FaCommentDots className="w-5 h-5" />, href: "/messages" },
  { id: "profile", label: "Profile", icon: <FaUser className="w-5 h-5" />, href: "/listings" },
];

const protectedTabs = ["favorites", "ads", "messages", "profile"];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function fetchUnread() {
      try {
        const data = await apiFetchAuth<{ unread_count: number }>(
          "/api/chats/unread_count/"
        );
        setUnreadCount(data.unread_count);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClick = (
    e: React.MouseEvent,
    tabId: string,
    href: string
  ) => {
    if (!user && protectedTabs.includes(tabId)) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-50 shadow-[0_-6px_20px_rgba(0,0,0,0.12)]">
      <div className="flex lg:hidden justify-around items-center py-1.5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const isProtected = protectedTabs.includes(tab.id);
          const isDisabled = !user && isProtected;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleClick(e, tab.id, tab.href)}
              className={`relative text-black flex flex-col items-center text-sm ${
                isDisabled ? "opacity-60" : ""
              }`}
            >
              <div
                className={`text-2xl ${
                  tab.highlight
                    ? "text-white bg-[#2AAEF7] p-2 rounded-full"
                    : isActive
                    ? "text-[#2AAEF7]"
                    : "text-gray-500"
                }`}
              >
                {tab.icon}
              </div>

              <span
                className={`mt-1 ${
                  isActive ? "text-black font-medium" : ""
                }`}
              >
                {tab.label}
              </span>

              {tab.id === "messages" && unreadCount > 0 && user && (
                <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
