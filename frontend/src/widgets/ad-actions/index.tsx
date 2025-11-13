"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import Link from "next/link";
import StartChatButton from "@/src/widgets/start-chat-button";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { apiFetchAuth } from "@/src/shared/api/auth";

interface AdPageProps {
  ad: Advertisement;
}

export default function AdActions({ ad }: AdPageProps) {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const isOwner = user?.username === ad.owner.username;

  const handleQuickMessage = async (text: string) => {
    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const chat = await apiFetchAuth(`/api/chats/`, {
        method: "POST",
        body: JSON.stringify({ ad: ad.id }),
      });

      await apiFetchAuth(`/api/messages/`, {
        method: "POST",
        body: JSON.stringify({ chat: chat.id, text }),
      });

      setTimeout(() => router.push(`/messages/${chat.id}`), 100);
    } catch (error) {
      console.error("Ошибка при отправке быстрого вопроса:", error);
    }
  };

  return (
    <div className="flex flex-col mb-6 lg:mt-0 mt-6">
      {isOwner ? (
        <>
          <Link
            href={`/edit/${ad.slug}`}
            className="w-full p-4 mb-2 bg-[#36B731] hover:bg-green-500 transition text-white rounded-2xl text-center"
          >
            Edit
          </Link>
          <button className="w-full p-4 bg-[#2AAEF7] hover:bg-blue-500 transition rounded-2xl cursor-pointer ">
            Increase views (Soon)
          </button>
        </>
      ) : (
        <>
          {accessToken ? (
            <button className="w-full p-4 bg-[#36B731] rounded-2xl cursor-pointer hover:bg-green-500 transition ">
              Show phone
            </button>
          ) : (
            <Link href={"/login"}>
              <button className="w-full p-4 bg-[#36B731] rounded-2xl cursor-pointer hover:bg-green-500 transition ">
                Login for show phone
              </button>
            </Link>
          )}

          {accessToken ? (
            <StartChatButton adId={ad.id} />
          ) : (
            <Link href={"/login"}>
              <button className="cursor-pointer w-full p-4 bg-[#2AAEF7] hover:bg-blue-500 transition mt-2 rounded-2xl">
                Login for messages
              </button>
            </Link>
          )}
        </>
      )}

      {/* 💬 Блок продавца */}
      <div className="flex items-center justify-between py-4">
        <Link href={`/profile/${ad.owner.profile.id}`}>
          <div>
            <h2 className="text-[#2AAEF7] font-semibold text-lg">
              {ad.owner.last_name} {ad.owner.first_name}
            </h2>
            <div className="flex items-center text-sm text-gray-700">
              <span className="mr-1">{ad.owner.profile?.rating}</span>
              <div className="flex text-yellow-400 mr-1">
                {[...Array(4)].map((_, i) => (
                  <FaStar key={i} />
                ))}
                <FaStar className="opacity-50" />
              </div>
              {ad.owner.profile?.reviews_count} reviews
            </div>
          </div>
        </Link>
        <img
          src={`${ad.owner.profile?.avatar}`}
          width={200}
          height={200}
          alt="Profile image"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* 💬 Быстрые вопросы */}
      {!isOwner && (
        <div>
          <h1 className="text-black font-bold text-3xl mt-4">Ask the Seller</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Hello!"
              className="w-full border rounded-3xl py-3 pl-4 pr-10 text-sm text-gray-800 my-2"
            />
            <FaArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer" />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {[
              "Is it still available?",
              "Is the price negotiable?",
              "When and where can I see the vehicle?",
            ].map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickMessage(text)} // ⚡ при клике отправляем и переходим
                className="bg-black text-white cursor-pointer rounded-full text-sm px-4 py-3 text-left hover:bg-gray-800 transition"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
