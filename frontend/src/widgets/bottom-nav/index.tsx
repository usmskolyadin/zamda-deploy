"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSearch, FaHeart, FaPlusCircle, FaCommentDots, FaUser } from "react-icons/fa";


const ProfileImg = (profileImgUrl: string) => {
  return (
    <img src={profileImgUrl} className="w-12 h-12 rounded-full" alt="" />
  )
}

const tabs = [
  { id: "search", label: "Search", icon: <FaSearch />, href: "/search" },
  { id: "favorites", label: "Favorites", icon: <FaHeart />, href: "/favorites" },
  { id: "ads", label: "My Ads", icon: <FaPlusCircle />, highlight: true, href: "/listings" },
  { id: "messages", label: "Messages", icon: <FaCommentDots />, href: "/messages" },
  { id: "profile", label: "Profile", icon: <FaUser />, href: "/listings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow z-50">
      <div className="flex lg:hidden justify-around items-center py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="relative flex flex-col items-center text-sm text-gray-600"
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
              <span className={`mt-1 ${isActive ? "text-[#2AAEF7] font-medium" : ""}`}>
                {tab.label}
              </span>

              {/* {tab.badge && (
                <span className="absolute top-0 right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                  {tab.badge}
                </span>
              )} */}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

