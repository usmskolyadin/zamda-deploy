"use client"

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import ThreeDotsDropdown from "@/src/widgets/dots";

type UserProfile = {
  avatar?: string | null;
  city?: string;
};

type Owner = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile: UserProfile;
};

type Message = {
  id: number;
  chat: number;
  sender: number; 
  text: string;
  created_at: string;
  is_read: boolean;
};

type Chat = {
  id: number;
  ad: number;
  ad_title: string;
  buyer: Owner;
  seller: Owner;
  messages: Message[];
  last_message?: string | null;
  created_at: string;
};


export default function Chat() {
  const params = useParams<{ id: string }>();
  const chatId = Number(params.id);
  const { accessToken, user } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

    const loadAll = async () => {
    if (!accessToken) return;
    const [c, msgsResponse] = await Promise.all([
        apiFetchAuth<Chat>(`/api/chats/${chatId}/`, accessToken),
        apiFetchAuth<any>(`/api/messages/?chat=${chatId}`, accessToken),
    ]);

    setChat(c);

    const newMessages = Array.isArray(msgsResponse) ? msgsResponse : msgsResponse.results || [];

    setMessages((prev) => {
        if (newMessages.length > prev.length) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
        }
        return newMessages;
    });

    setLoading(false);
    };

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 3000);
    return () => clearInterval(t);
  }, [accessToken, chatId]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Send button clicked", { text });
    if (!text) return;

    try {
      const created = await apiFetchAuth<Message>("/api/messages/", {
        method: "POST",
        body: JSON.stringify({ chat: chatId, text }),
      });
      console.log("Message created:", created);
      setText("");
      setMessages(prev => [...prev, created]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  useEffect(() => {
    if (chatId && accessToken) {
      apiFetchAuth(`/api/chats/${chatId}/mark-read/`, {
        method: "POST",
      }).catch(console.error);
    }
  }, [chatId, accessToken, messages.length]);


  if (!accessToken) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <p className="text-xl text-black">
          Авторизуйся, чтобы видеть сообщения.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <p className="text-xl text-black">Загрузка…</p>
      </div>
    );
}
  if (!chat) return <div className="bg-[#ffffff] h-sreen  max-w-screen-xl mx-auto p-4">Чат не найден.</div>;

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff]  pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/4 hidden lg:block">
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
                    <h2 className="text-black font-bold  lg:text-xl text-2xl py-2">{user?.first_name} {user?.last_name}</h2>
                    <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-1 text-black text-lg font-bold">{user?.profile.rating}</span>
                        <div className="flex text-yellow-400 mr-1">
                        {[...Array(4)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                        <FaStar className="opacity-50" />
                        </div>
                        <Link className="hover:underline text-[#2AAEF7] " href={`/reviews/${user?.profile?.id ?? 0}`}>
                          <span className="text-lg ml-1">
                            {user?.profile?.reviews_count ?? 0} reviews
                          </span>
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
                    <Link href="/reviews"><span className="text-[#2AAEF7] text-md h-12">My Reviews</span> </Link>
                </div>
                <div className="py-3 flex flex-col border-b border-gray-300">
                    <Link href="listings"><span className="text-[#2AAEF7] text-md h-12">Wallet</span> </Link>
                    <Link href="favorites"><span className="text-[#2AAEF7] text-md h-12">Paid services</span></Link>
                </div>
                <div className="py-3 flex flex-col mb-4">
                    <Link href="/profile/edit"><span className="text-[#2AAEF7] text-md h-12">Profile settings</span> </Link>
                </div>
            </div>

          </div>
          <div className=" lg:w-3/4 lg:ml-24">
              {/* <div className="rounded-3xl w-full bg-[#F2F1F0] h-[200px]  flex justify-center items-center">
                <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
              </div> */}


                <div>
            </div>
            <div className="flex flex-col">
                <div className="flex items-center mt-4 min-w-full rounded-2xl p-2">
                    <div className="mr-2 flex items-center">
                        <Link href={"/messages"}>
                            <svg className="p-0.5 mr-3 ml-2" width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.4207 25.8094L2.00012 14.3888M13.4207 2.96822L2.00012 14.3888M2.00012 14.3888H14.3887H26.7772" stroke="#333333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                        <img
                        className="min-w-12 max-w-12 min-h-12 max-h-12 rounded-full"
                        src={
                            chat.buyer.id === user?.id
                            ? chat.seller.profile.avatar || "/default-avatar.png"
                            : chat.buyer.profile.avatar || "/default-avatar.png"
                        }
                        alt=""
                        width={100}
                        height={100}
                        />
                   </div>
                    <div className="flex justify-between w-full">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl text-black font-bold">
                                       {chat.buyer.id === user?.id
                                    ? `${chat.seller.first_name} ${chat.seller.last_name}`
                                    : `${chat.buyer.first_name} ${chat.buyer.last_name}`}
                                </h1>
                            <h1 className="text-sm text-gray-500 ml-2">{chat.ad_title}</h1>
                        </div>
                        <div className="flex">
                            <ThreeDotsDropdown chatId={chatId} accessToken={accessToken} />
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="p-4">Загрузка сообщений...</div>
                    ) : (
                <div className="p-4 h-[60vh] overflow-y-auto">
                {messages.map((m, index) => {
                  const mine = m.sender === user?.id;
                  const key = m.id ?? `temp-${index}`;
                  return (
                    <div key={m.id ?? index} className={`flex mb-2 ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-2xl px-4 py-2 max-w-[75%] ${mine ? "bg-blue-500 text-white" : "bg-gray-100 text-black"}`}>
                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                        <div className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-gray-500"}`}>
                          {m.created_at 
                            ? new Date(m.created_at).toLocaleString([], { 
                                year: "numeric", 
                                month: "2-digit", 
                                day: "2-digit", 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              }) 
                            : "—"}
                        </div>
                        </div>
                    </div>
                    );
                })}
                <div ref={bottomRef} />
                </div>
                )}
               <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a message…"
                        className="flex-1 border rounded-3xl py-3 px-4 text-sm text-gray-800"
                    />
                    <button className="rounded-3xl px-5 py-3 bg-black text-white">Send</button>
                </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
