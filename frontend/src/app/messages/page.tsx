"use client"

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useAuth } from "@/src/features/context/auth-context";
import Sidebar from "@/src/widgets/sidebar";
import { useAds } from "@/src/features/hooks/use-ad";
import { AdBanner } from "@/src/widgets/ad";


type UserProfile = { avatar?: string | null; city?: string };
type Owner = { id: number; username: string; first_name: string; last_name: string; email: string; profile: UserProfile };

type Chat = {
  id: number;
  ad: number;
  ad_title: string;
  buyer: Owner;
  seller: Owner;
  created_at: string;
  messages: { id: number; text: string; created_at: string; sender: number; is_read: boolean }[];
};

export default function Chats() {
  const { accessToken, user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { advs } = useAds("category")

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const data = await apiFetchAuth<Chat[]>("/api/chats/", accessToken);
        setChats(data.results);;
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

const items = useMemo(() => {
  return chats
    .filter((c) => (c.messages?.length ?? 0) > 0) // ❗ важно
    .map((c) => ({
      ...c,
      last: c.messages?.[c.messages.length - 1],
      unread: c.unread,
    }))
    .sort((a, b) => {
      const at = a.last ? new Date(a.last.created_at).getTime() : 0;
      const bt = b.last ? new Date(b.last.created_at).getTime() : 0;
      return bt - at;
    });
}, [chats]);

const formatDate = (date?: string) => {
  if (!date) return "";

  const d = new Date(date);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getChatPartner = (chat: Chat, userId?: number) => {
  if (!userId) return chat.buyer;

  return chat.buyer.id === userId ? chat.seller : chat.buyer;
};

if (!accessToken) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <p className="text-xl text-black">Login to messages</p>
    </div>
  );
}

if (loading) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <p className="text-xl text-black">Loading…</p>
    </div>
  );
}

  return (
    <div className=" w-full">
      <section className="bg-white pb-16 pt-6 px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="max-w-screen-xl lg:flex mx-auto px-4 sm:px-6 lg:px-12">
          <Sidebar/>
          <div className=" lg:w-3/4 lg:ml-24">
            <AdBanner ads={advs} height={250} />
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Messages</h1>
            </div>

                <div>
            </div>
            <div className="flex flex-col min-h-screen">
{items.map((c) => {
  const partner = getChatPartner(c, user?.id);
  const last = c.last;

  return (
    <Link key={c.id} href={`/messages/${c.id}`} className="block mt-3">
<div
  className="
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-2 sm:gap-0
    rounded-2xl sm:rounded-3xl
    p-3 sm:p-5
    border border-gray-200
    bg-gray-100
    transition
    hover:bg-gray-200 hover:shadow-md
  "
>
  {/* LEFT */}
  <div className="flex items-center gap-3 min-w-0 flex-1">
    <img
      src={partner.profile.avatar || "/default-avatar.png"}
      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
    />

    <div className="flex flex-col min-w-0 flex-1">
      
      {/* NAME + DATE (mobile inline) */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-black font-semibold truncate">
          {partner.first_name} {partner.last_name}
        </div>

        <span className="text-[11px] text-gray-400 whitespace-nowrap sm:hidden">
          {last?.created_at ? formatDate(last.created_at) : ""}
        </span>
      </div>

      {/* AD TITLE (weaker, separated color) */}
      <div className="text-gray-400 text-xs truncate">
        {c.ad_title}
      </div>

      {/* MESSAGE */}
      <div className="text-gray-600 text-sm truncate">
        {last?.text || "No messages yet"}
      </div>
    </div>
  </div>

  {/* RIGHT (desktop only) */}
  <div className="hidden sm:flex flex-col items-end gap-2">
    <span className="text-xs text-gray-400 whitespace-nowrap">
      {last?.created_at ? formatDate(last.created_at) : ""}
    </span>

    {c.unread > 0 && (
      <div className="min-w-6 h-6 px-2 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
        {c.unread}
      </div>
    )}
  </div>

  {/* MOBILE unread (inline right top corner feel) */}
  {c.unread > 0 && (
    <div className="sm:hidden absolute right-5 top-4 min-w-5 h-5 px-1.5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
      {c.unread}
    </div>
  )}
</div>
    </Link>
  );
})}

            {items.length === 0 && (
              <div className="text-gray-500">You don't have messages</div>
            )}

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
