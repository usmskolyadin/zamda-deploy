"use client"

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useAuth } from "@/src/features/context/auth-context";
import Sidebar from "@/src/widgets/sidebar";


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
    return chats.map((c) => ({
      ...c,
      last: c.messages?.[c.messages.length - 1],
      unread: c.unread_count, 
    })).sort((a, b) => {
      const at = a.last ? new Date(a.last.created_at).getTime() : 0;
      const bt = b.last ? new Date(b.last.created_at).getTime() : 0;
      return bt - at;
    });
  }, [chats]);


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
      <section className="bg-[#ffffff]  pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <Sidebar/>
          <div className=" lg:w-3/4 lg:ml-24">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px]  flex justify-center items-center hidden lg:flex">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Messages</h1>
            </div>

                <div>
            </div>
            <div className="flex flex-col min-h-screen">
            {items.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`} className="block mt-3">
              <div className={`flex items-center justify-between rounded-2xl p-4 transition ${
                c.unread > 0 ? "bg-blue-100" : "bg-gray-100"
              } hover:bg-gray-200`}>
                <div className="flex">
                  <img src={c.seller.profile.avatar} className="rounded-full w-12 h-12 mr-4" />
                  <div>
                    <div className="text-black font-semibold">{c.seller.first_name} {c.seller.last_name} <span className="text-gray-600 ml-0.5">{c.ad_title}</span></div>
                    <div className="text-gray-600 text-sm truncate max-w-[60ch]">
                      {c.last ? c.last.text : "No messages yet"}
                    </div>
                  </div>
                </div>
                {c.unread > 0 && (
                  <div className="min-w-6 h-6 px-2 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {c.unread}
                  </div>
                )}
              </div>
            </Link>
        ))}

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
