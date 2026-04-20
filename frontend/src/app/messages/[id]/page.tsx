"use client"

import Link from "next/link";
import Sidebar from "@/src/widgets/sidebar";
import ThreeDotsDropdown from "@/src/widgets/dots";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import BackButton from "@/src/widgets/back-button";

type UserProfile = { avatar?: string | null };
type Owner = { id: number; first_name: string; last_name: string; profile: UserProfile };
type Message = { id?: number; chat: number; sender: number; text: string; created_at: string; is_read: boolean; isMine?: boolean; tempId?: string };
type Chat = { id: number; ad_title: string; buyer: Owner; seller: Owner; messages: Message[]; created_at: string };

export default function Chat() {
  const params = useParams<{ id: string }>();
  const chatId = Number(params.id);
  const { accessToken, user } = useAuth();
const didInitScrollRef = useRef(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;

    isAtBottomRef.current = atBottom;
  };


  // загрузка самого чата один раз
  const loadChat = async () => {
    if (!accessToken) return;
    try {
      const c = await apiFetchAuth<Chat>(`/api/chats/${chatId}/`, accessToken);
      setChat(c);
    } catch (err) {
      console.error("Failed to load chat", err);
      setChat(null);
    }
  };

  const loadMessages = async () => {
    if (!accessToken) return;
    try {
      const msgsResponse = await apiFetchAuth<any>(`/api/messages/?chat=${chatId}`, accessToken);
      const serverMessages: Message[] = Array.isArray(msgsResponse) ? msgsResponse : msgsResponse.results || [];

      setMessages(prev => {
        const serverMap = new Map<number, Message>();
        serverMessages.forEach(m => serverMap.set(m.id!, { ...m, isMine: m.sender === user?.id }));

        // Сохраняем временные сообщения (у которых нет id)
        const tempMessages = prev.filter(m => m.id === undefined);

        // Убираем дубликаты: если сервер вернул реальное сообщение с тем же текстом, убираем временное
        const filteredTemp = tempMessages.filter(tm => !Array.from(serverMap.values()).some(sm => sm.text === tm.text));

        // Объединяем и сортируем
        const merged = [
          ...serverMap.values(),
          ...filteredTemp
        ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return merged;
      });

      // mark read
      await apiFetchAuth(`/api/chats/${chatId}/mark-read/`, { method: "POST" });

      setLoading(false);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    loadChat();
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [accessToken, chatId]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text) return;
    const tempId = Date.now().toString();
    const tempMessage: Message = {
      chat: chatId,
      sender: user!.id,
      text,
      created_at: new Date().toISOString(),
      is_read: false,
      isMine: true,
      tempId,
    };
    setMessages(prev => [...prev, tempMessage]);
    setText("");

    try {
      const created = await apiFetchAuth<Message>("/api/messages/", {
        method: "POST",
        body: JSON.stringify({ chat: chatId, text }),
      });

      // заменяем временное сообщение реальным
      setMessages(prev =>
        prev.map(m => (m.tempId === tempId ? { ...created, isMine: true } : m))
      );
    } catch (err) {
      console.error("Failed to send message", err);
      // если не отправилось, можно оставить tempMessage или пометить ошибку
    }
  };

const scrollToBottom = (smooth = false) => {
  const el = containerRef.current;
  if (!el) return;

  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
};

useEffect(() => {
  if (!messages.length) return;

  if (isFirstLoadRef.current) {
    scrollToBottom(false);
    isFirstLoadRef.current = false;
  }
}, [messages]);

  if (!accessToken) return <div className="w-full  h-screen flex items-center justify-center bg-white"><p className="text-xl text-black">Login to view messages</p></div>;
  if (loading) return <div className="w-full h-screen flex items-center justify-center bg-white"><p className="text-xl text-black">Loading…</p></div>;
  if (!chat) return <div className="bg-white h-screen w-full mx-auto p-4">Чат не найден.</div>;

  return (
    <div className="w-full">
<section className="lg:h-[80dvh] h-[75dvh] flex flex-col overflow-hidden bg-white">
  <div className="max-w-screen-xl mx-auto flex flex-1 w-full min-h-0 px-4 sm:px-6 lg:px-12">
    <Sidebar />

    <div className="flex flex-col flex-1 lg:ml-24 min-h-0">
      
      {/* HEADER */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white z-10 shrink-0">
        <BackButton className="mr-2 p-1 lg:w-12 w-10" />

        <img
          className="w-12 h-12 rounded-full object-cover"
          src={
            chat.buyer.id === user?.id
              ? chat.seller.profile.avatar || "/default-avatar.png"
              : chat.buyer.profile.avatar || "/default-avatar.png"
          }
        />

        <div className="ml-3 flex-1">
          <h1 className="text-lg font-bold text-black leading-tight">
            {chat.buyer.id === user?.id
              ? `${chat.seller.first_name} ${chat.seller.last_name}`
              : `${chat.buyer.first_name} ${chat.buyer.last_name}`}
          </h1>

          <p className="text-xs text-gray-500 truncate">
            {chat.ad_title}
          </p>
        </div>

        <ThreeDotsDropdown chatId={chatId} accessToken={accessToken} />
      </div>

<div
  ref={containerRef}
  onScroll={handleScroll}
  className="flex-1 min-h-0 overflow-y-auto bg-gray-50 px-4 py-4 space-y-3 pb-4"
>
        {messages.map((m, index) => (
          <div
            key={m.id ?? m.tempId ?? index}
            className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[80%] px-4 py-2 rounded-2xl shadow-sm
                ${m.isMine
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black border border-gray-200"}
              `}
            >
              <div className="text-sm whitespace-pre-wrap break-words">
                {m.text}
              </div>

              <div className="flex justify-between items-center mt-1">
                <span className={`text-[10px] ${m.isMine ? "text-blue-100" : "text-gray-400"}`}>
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>

                {m.isMine && (
                  <span className="text-[10px] text-blue-100 ml-2">
                    {m.is_read ? <FaCheckDouble /> : <FaCheck />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="
          shrink-0
          border-t border-gray-200
          bg-white text-black
          p-3
          flex gap-2
          sticky bottom-0
        "
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a message…"
          className="flex-1 border rounded-full px-4 py-3 text-sm focus:outline-none"
        />

        <button className="px-5 py-3 rounded-full bg-black text-white">
          Send
        </button>
      </form>

    </div>
  </div>
</section>
    </div>
  );
}
