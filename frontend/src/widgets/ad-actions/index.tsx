"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import Link from "next/link";
import StartChatButton from "@/src/widgets/start-chat-button";
import PhoneVerificationModal from "@/src/widgets/sidebar/PhoneVerificationModal";
import VerificationBadges from "@/src/widgets/VerificationBadges";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { Profile } from "@/src/app/profile/[id]/page";
import { apiFetch } from "@/src/shared/api/base";

interface AdPageProps {
  ad: Advertisement;
}

export default function AdActions({ ad }: AdPageProps) {
  const { user, accessToken, refreshUser, isInitialized } = useAuth();
  const router = useRouter();
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [profile, setProfile] = useState<Profile>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const isOwner = user?.username === ad.owner.username;
  const userPhoneVerified = user?.verification?.phone_verified;
  const sellerPhone = ad.owner.verification?.phone_number;

  const fetchProfile = async () => {
    if (!ad?.owner?.id) return;

    const fetcher =
      accessToken ? apiFetchAuth : apiFetch;

    const res = await fetcher<Profile>(
      `/api/profiles/${ad.owner.profile.id}/`
    );
  console.log("PROFILE RESPONSE", res);
    setProfile(res);
    setIsFollowing(res.is_following);
    setFollowersCount(res.followers_count);
  };

  useEffect(() => {
    if (!ad?.owner?.id) return;
    if (!isInitialized) return;

    fetchProfile();
  }, [
    ad?.owner?.id,
    accessToken,
    isInitialized,
  ]);

  const reasons = [
    { id: "sold", label: "Sold on Zamda" },
    { id: "changed_mind", label: "Changed my mind about selling" },
    { id: "other", label: "Other" },
  ];

  const toggleFollow = async () => {
    try {
      const res = await apiFetchAuth<{
        following: boolean;
      }>(
        `/api/users/${ad.owner.username}/follow/`,
        {
          method: "POST",
        }
      );

      setIsFollowing(res.following);
      setFollowersCount((prev) =>
        res.following ? prev + 1 : prev - 1
      );
    } catch (error) {
      console.error(error);
    }
  };

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

  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  
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
              onClick={() => setDeleteModalOpen(true)}
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
                <div className="overflow-hidden">
                  {!showPhone ? (
                    <button
                      onClick={() => setShowPhone(true)}
                      className="
                        w-full
                        p-3.5
                        bg-[#36B731]
                        rounded-3xl
                        text-white
                        cursor-pointer
                        transition-all
                        duration-300
                        hover:bg-green-500
                        active:scale-[0.98]
                      "
                    >
                      Show phone
                    </button>
                  ) : (
                    <div
                      className="
                        rounded-3xl
                        border
                        border-green-200
                        bg-green-50
                        
                        p-4
                        text-center
                        text-white
                        animate-in
                        fade-in
                        zoom-in-95
                        duration-300
                      "
                    >
                      <div className="text-xs uppercase tracking-wider text-green-700 mb-1">
                        Seller phone
                      </div>

                      {isMobile ? (
                        <a
                          href={`tel:${sellerPhone.replace(/[^\d+]/g, "")}`}
                          className="
                            block
                            text-xl
                            font-bold
                            text-black
                            
                            hover:text-[#36B731]
                            transition
                          "
                        >
                          {sellerPhone}
                        </a>
                      ) : (
                        <a
                          href={`tel:${sellerPhone.replace(/[^\d+]/g, "")}`}
                          className="
                            block
                            text-xl
                            font-bold
                            text-black
                            hover:text-[#36B731]
                            transition
                            md:pointer-events-none
                          "
                        >
                          {sellerPhone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
              <button
                disabled
                className="w-full p-3.5 bg-[#36B731] opacity-50 rounded-3xl hover:bg-green-500 transition text-white"
              >
               Show phone
              </button>
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
              className="w-full text-center p-3.5 bg-[#36B731] rounded-3xl cursor-pointer hover:bg-green-500 transition text-white"
            >
              Show phone
            </button>
          )}

          {accessToken ? (
            <StartChatButton adId={ad.id} />
          ) : (
            <Link href={"/login"}>
              <button className="cursor-pointer text-white w-full p-3.5 bg-[#2AAEF7] hover:bg-blue-500 transition mt-2 rounded-3xl">
                Login for messages
              </button>
            </Link>
          )}
        </>
      )}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-black mb-4">
              Why are you deleting this ad?
            </h2>

            <div className="flex flex-col gap-3">
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2 text-black cursor-pointer"
                >
                  <input
                    type="radio"
                    name="deleteReason"
                    value={r.id}
                    checked={deleteReason === r.id}
                    onChange={() => setDeleteReason(r.id)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteReason("");
                }}
                className="flex-1 cursor-pointer py-2 rounded-3xl bg-gray-200 text-black hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete();
                  setDeleteModalOpen(false);
                }}
                disabled={!deleteReason}
                className="flex-1 cursor-pointer py-2 rounded-3xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between py-4">
        <Link href={`/profile/${ad.owner.profile?.id ?? ad.owner.id}`}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[#2AAEF7] font-semibold text-lg">
                {ad.owner.first_name} {ad.owner.last_name} 
              </h2>
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
                user ? (
                  <div className="w-full gap-2 pb-4">
                    <button
                      onClick={toggleFollow}
                      className={`
                        px-1 w-full
                        py-3.5
                        rounded-3xl
                        font-medium
                        transition cursor-pointer
                        ${
                          isFollowing
                            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            : "bg-[#ff9d20] text-white hover:opacity-90"
                        }
                      `}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                </div>
                ) : (
                <button
                  onClick={() => router.push("/login")}
                  className={`
                    px-1
                    py-3.5
                    rounded-3xl
                    font-medium
                    transition cursor-pointer
                    ${
                      isFollowing
                        ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }
                  `}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                ))
              }

        <VerificationBadges verification={ad.owner.verification} />
 
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
