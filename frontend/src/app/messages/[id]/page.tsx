"use client"

import Link from "next/link";
import Sidebar from "@/src/widgets/sidebar";
import ThreeDotsDropdown from "@/src/widgets/dots";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { FaCheck, FaCheckDouble } from "react-icons/fa";

type UserProfile = { avatar?: string | null };
type Owner = { id: number; first_name: string; last_name: string; profile: UserProfile };
type Message = { id?: number; chat: number; sender: number; text: string; created_at: string; is_read: boolean; isMine?: boolean; tempId?: string };
type Chat = { id: number; ad_title: string; buyer: Owner; seller: Owner; messages: Message[]; created_at: string };

export default function Chat() {
  const params = useParams<{ id: string }>();
  const chatId = Number(params.id);
  const { accessToken, user } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

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

        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
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
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);

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

  if (!accessToken) return <div className="w-screen h-screen flex items-center justify-center bg-white"><p className="text-xl text-black">Login to view messages</p></div>;
  if (loading) return <div className="w-screen h-screen flex items-center justify-center bg-white"><p className="text-xl text-black">Loading…</p></div>;
  if (!chat) return <div className="bg-white h-screen max-w-screen-xl mx-auto p-4">Чат не найден.</div>;

  return (
    <div className="w-full">
      <section className="bg-white pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <Sidebar />
          <div className="lg:w-3/4 lg:ml-24 flex flex-col">
            <div className="flex items-center mt-4 min-w-full rounded-2xl p-2">
              <div className="mr-2 flex items-center">
                <Link href="/messages">
                  <svg className="p-0.5 mr-3 ml-2" width="29" height="28" viewBox="0 0 29 28" fill="none">
                    <path d="M13.4207 25.8094L2.00012 14.3888M13.4207 2.96822L2.00012 14.3888M2.00012 14.3888H14.3887H26.7772" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <img
                  className="min-w-12 max-w-12 min-h-12 max-h-12 rounded-full object-cover"
                  src={chat.buyer.id === user?.id ? chat.seller.profile.avatar || "/default-avatar.png" : chat.buyer.profile.avatar || "/default-avatar.png"}
                  alt=""
                />
              </div>
              <div className="flex justify-between w-full items-center">
                <div>
                  <h1 className="text-xl text-black font-bold">
                    {chat.buyer.id === user?.id
                      ? `${chat.seller.first_name} ${chat.seller.last_name}`
                      : `${chat.buyer.first_name} ${chat.buyer.last_name}`}
                  </h1>
                  <h2 className="text-sm text-gray-500">{chat.ad_title}</h2>
                </div>
                <ThreeDotsDropdown chatId={chatId} accessToken={accessToken} />
              </div>
            </div>

            <div className="flex-1 p-4 max-h-[60vh] min-h-[60vh] overflow-y-auto">
              {messages.map((m, index) => (
                <div key={m.id ?? m.tempId ?? index} className={`flex mb-2 ${m.isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-2xl px-4 py-2 max-w-[75%] ${m.isMine ? "bg-blue-500 text-white" : "bg-gray-100 text-black"}`}>
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    <div className="flex justify-between items-end text-[10px] mt-1">
                      <span className={m.isMine ? "text-blue-100" : "text-gray-500"}>
                        {m.created_at ? new Date(m.created_at).toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                      {m.isMine && (
                        <span className="ml-2 text-blue-100">
                          {m.is_read ? <FaCheckDouble /> : <FaCheck />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write a message…"
                className="flex-1 border rounded-3xl py-3 px-4 text-sm text-gray-800"
              />
              <button type="submit" className="rounded-3xl px-5 py-3 bg-black text-white">Send</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
