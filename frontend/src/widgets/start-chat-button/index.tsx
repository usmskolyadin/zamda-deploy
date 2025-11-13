"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useEffect, useState } from "react";

function StartChatButton({ adId }: { adId: number }) {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !accessToken || !user) {
    return null;  
  }
  const startChat = async () => {
    if (!accessToken || !user) return;

    const qs = new URLSearchParams({ ad: String(adId) }).toString();
    const response = await apiFetchAuth<any>(`/api/chats/?${qs}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const chats = Array.isArray(response) ? response : response.results || [];

    const existing = chats.find(
      (c: any) => c.buyer === user.id || c.seller === user.id
    );

    let chatId: number | null = existing?.id ?? null;

    if (!chatId) {
      const created = await apiFetchAuth<any>("/api/chats/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ad: adId }),
      });

      const chat = created?.id ? created : created?.results?.[0];
      if (!chat?.id) {
        console.error("Chat creation failed:", created);
        return;
      }

      chatId = chat.id;
    }

    if (!chatId || isNaN(Number(chatId))) {
      console.error("Invalid chatId:", chatId);
      return;
    }

    router.push(`/messages/${chatId}`);

      };

  return (
    <button
      onClick={startChat}
      className="w-full p-4 hover:bg-blue-500 cursor-pointer transition bg-[#2AAEF7] mt-2 rounded-2xl"
    >
      Write message
    </button>
  );
}
export default StartChatButton;
  