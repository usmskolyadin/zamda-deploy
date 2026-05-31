"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import Link from "next/link";
import StartChatButton from "@/src/widgets/start-chat-button";
import PhoneVerificationModal from "@/src/widgets/sidebar/PhoneVerificationModal";
import VerificationBadges from "@/src/widgets/VerificationBadges";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { apiFetchAuth } from "@/src/shared/api/auth";

interface AdPageProps {
  ad: Advertisement;
}

export default function AdActions({ ad }: AdPageProps) {
  const { user, accessToken, refreshUser } = useAuth();
  const router = useRouter();
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const isOwner = user?.username === ad.owner.username;
  const userPhoneVerified = user?.verification?.phone_verified;
  const sellerPhone = ad.owner.verification?.phone_number;

  const handleQuickMessage = async (text: string) => {
    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const chat = await apiFetchAuth<{ id: number }>(`/api/chats/`, {
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
  
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this advertisement? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await apiFetchAuth(`/api/ads/${ad.slug}/`, {
        method: "DELETE",
      });

      router.push("/listings");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete advertisement");
    }
  };

  return (
    <div className="flex flex-col mb-6 lg:mt-0 mt-6">
      {isOwner ? (
        <div className="w-full">
          <div className="grid grid-cols-2 gap-1">
            <Link
              href={`/edit/${ad.slug}`}
              className=" p-3.5 mb-2 bg-[#36B731] hover:bg-green-500 transition text-white rounded-3xl text-center"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="p-3.5 mb-2 cursor-pointer bg-red-400 hover:bg-red-500 transition text-white rounded-3xl text-center"
            >
              Delete
            </button>
          </div>
          <button className="w-full p-3.5 bg-[#2AAEF7] text-white hover:bg-blue-500 transition rounded-3xl cursor-pointer ">
            Increase views (Soon)
          </button>
        </div>
      ) : (
        <>
          {accessToken ? (
            userPhoneVerified ? (
              sellerPhone ? (
                <div className="rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                  <div className="font-semibold text-black">Seller phone</div>
                  <a href={`tel:${sellerPhone}`} className="underline">
                    {sellerPhone}
                  </a>
                </div>
              ) : (
                <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                  Seller has not provided a phone number.
                </div>
              )
            ) : (
              <button
                onClick={() => setPhoneModalOpen(true)}
                className="w-full p-3.5 bg-[#36B731] rounded-3xl hover:bg-green-500 transition text-white"
              >
               Show phone
              </button>
            )
          ) : (
            <button
              onClick={() => setPhoneModalOpen(true)}
              className="w-full p-3.5 bg-[#36B731] rounded-3xl cursor-pointer hover:bg-green-500 transition text-white"
            >
              Verify phone to view seller number
            </button>
          )}

          {accessToken ? (
            <StartChatButton adId={ad.id} />
          ) : (
            <Link href={"/login"}>
              <button className="cursor-pointer w-full p-3.5 bg-[#2AAEF7] hover:bg-blue-500 transition mt-2 rounded-3xl">
                Login for messages
              </button>
            </Link>
          )}
        </>
      )}

      <div className="flex items-center justify-between py-4">
        <Link href={`/profile/${ad.owner.profile?.id ?? ad.owner.id}`}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[#2AAEF7] font-semibold text-lg">
                {ad.owner.last_name} {ad.owner.first_name}
              </h2>
              <VerificationBadges verification={ad.owner.verification} />
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="mr-1">{ad.owner.profile?.rating ?? 0}</span>
              <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < (ad.owner.profile?.rating ?? 0) ? "w-4" : "w-4 opacity-30"}
                    />
                  ))}
              </div>
              {ad.owner.profile?.reviews_count ?? 0} reviews
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
            ].map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickMessage(text)} 
                className="bg-black text-white cursor-pointer rounded-full text-sm px-4 py-3 text-left hover:bg-gray-800 transition"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
      <PhoneVerificationModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        refreshUser={refreshUser}
        onVerified={(phone) => {
          if (!accessToken) {
            router.push(`/register?phone=${encodeURIComponent(phone)}`);
          }
        }}
      />
    </div>
  );
}
