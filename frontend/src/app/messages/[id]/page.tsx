"use client"

import Link from "next/link";
import Sidebar from "@/src/widgets/sidebar";
import ThreeDotsDropdown from "@/src/widgets/dots";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { FaCheck, FaCheckDouble, FaPaperclip } from "react-icons/fa";
import BackButton from "@/src/widgets/back-button";
import LoadingScreen from '@/src/components/LoadingScreen';
import { SendIcon } from "lucide-react";

const MAX_FILE_SIZE_MB = 15;

type UserProfile = { avatar?: string | null };
type Owner = { id: number; first_name: string; last_name: string; profile: UserProfile };
type Message = { id?: number; chat: number; sender: number; text: string; created_at: string; is_read: boolean; images?: string[]; isMine?: boolean; tempId?: string };
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const firstLoadRef = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;

    if (atBottom && showScrollBtn) setShowScrollBtn(false);
    if (!atBottom && !showScrollBtn) setShowScrollBtn(true);
  };


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
    if (!accessToken || !user) return;
    try {
      const msgsResponse = await apiFetchAuth<any>(`/api/messages/?chat=${chatId}`, accessToken);
      const serverMessages: Message[] = Array.isArray(msgsResponse) ? msgsResponse : msgsResponse.results || [];

      setMessages(prev => {
        const serverIds = new Set<number>();
        const result: Message[] = [];

        for (const m of serverMessages) {
          const msg = { ...m, isMine: m.sender === user?.id };
          serverIds.add(msg.id!);
          result.push(msg);
        }

        for (const m of prev) {
          if (m.id === undefined || !serverIds.has(m.id)) {
            result.push(m);
          }
        }

        return result.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      await apiFetchAuth(`/api/chats/${chatId}/mark-read/`, { method: "POST" });

      setLoading(false);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    if (!accessToken || !user) return;

    loadChat();
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

  return () => clearInterval(interval);

}, [accessToken, chatId, user?.id]);
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text && selectedFiles.length === 0) return;
    setSendError(null);
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

    const body = selectedFiles.length > 0
      ? (() => {
          const fd = new FormData();
          fd.append("chat", String(chatId));
          if (text) fd.append("text", text);
          selectedFiles.forEach(f => fd.append("images", f));
          return fd;
        })()
      : JSON.stringify({ chat: chatId, text });

    try {
      const created = await apiFetchAuth<Message>("/api/messages/", {
        method: "POST",
        body,
      });

      console.log("Message created:", created);

      if (!created || !created.id) {
        console.error("Server returned no id for message");
        setMessages(prev => prev.filter(m => m.tempId !== tempId));
        return;
      }

      setMessages(prev =>
        prev.map(m => (m.tempId === tempId ? { ...created, isMine: true } : m))
      );
      setSelectedFiles([]);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.filter(m => m.tempId !== tempId));

      let friendly = "Failed to send message. Please try again.";
      try {
        const parsed = JSON.parse(err?.message);
        friendly = parsed?.detail || parsed?.images?.[0] || friendly;
      } catch {}

      setSendError(friendly);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const oversized = files.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);

    setSendError(
      oversized.length > 0
        ? `Some images exceed ${MAX_FILE_SIZE_MB} MB and were not added.`
        : null
    );

    setSelectedFiles(prev => {
      const combined = [...prev, ...validFiles].slice(0, 5);
      return combined;
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  useEffect(() => {
    if (!messages.length) return;
    const el = containerRef.current;
    if (!el) return;

    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
      return;
    }

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (atBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);


  if (!accessToken) return <div className="w-full  h-screen flex items-center justify-center bg-white"><p className="text-xl text-black">Login to view messages</p></div>;
  if (loading) return <LoadingScreen />;
  if (!chat) return <div className="bg-white h-screen w-full mx-auto p-4">Not defined</div>;

  return (
    <div className="w-full">
<section className="lg:h-[80dvh] h-[75dvh] flex flex-col overflow-hidden bg-white">
  <div className="max-w-screen-xl mx-auto flex flex-1 w-full min-h-0 px-4 sm:px-6 lg:px-12">
    <Sidebar hideBanner={true}/>

    <div className="flex flex-col flex-1 min-w-0 lg:ml-24 min-h-0">
      
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
              {m.images && m.images.length > 0 && (
                <div className={`grid gap-1 mb-1 ${m.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {m.images.map((url, i) => {
                    const count = m.images!.length;
                    let cls = "rounded-lg object-cover w-full cursor-pointer transition hover:opacity-90 ";
                    if (count === 1) cls += "max-h-80";
                    else if (count === 2) cls += "h-44";
                    else if (count === 3 && i === 0) cls += "col-span-2 h-52";
                    else if (count === 3) cls += "h-32";
                    else if (count === 4) cls += "h-36";
                    else cls += "h-32";
                    return (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className={cls}
                        onClick={() => setLightboxUrl(url)}
                      />
                    );
                  })}
                </div>
              )}

              {m.text && (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {m.text}
                </div>
              )}

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

        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom(true)}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:opacity-80 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="
          shrink-0
          border-t border-gray-200
          bg-white text-black
          p-3
          sticky bottom-0
          min-w-0
        "
        >
        {sendError && (
          <p className="text-red-500 text-xs mb-2">{sendError}</p>
        )}

        {selectedFiles.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 cursor-pointer rounded-full rounded-full border  hover:bg-gray-100 transition"
          >
            <FaPaperclip className="w-5 h-5 text-gray-800" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <textarea
            value={text}
            onChange={e => {
              setText(e.target.value);

              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
            placeholder="Write a message…"
            rows={1}
            className="
              flex-1
              min-w-0
              w-full
              resize-none
              overflow-y-auto
              no-scrollbar
              border
              rounded-3xl
              px-4
              py-3
              text-base
              leading-6
              focus:outline-none
            "
            style={{ maxHeight: "160px" }}
          />

          <button className="px-5 py-3 rounded-full cursor-pointer hover:opacity-80 transition bg-black text-white shrink-0">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain cursor-default"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  </div>
</section>
    </div>
  );
}
