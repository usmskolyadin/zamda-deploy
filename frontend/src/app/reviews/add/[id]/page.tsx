"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { Profile } from "@/src/app/profile/[id]/page";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/src/shared/api/base";
import { Star } from "lucide-react";


export default function AddReview() {
  const { accessToken, user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const router = useRouter()
  const params = useParams<{ id: string }>();
  const profileId = params?.id;

  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiFetch<Profile>(`/api/profiles/${profileId}/`);
        if (!res || !res.id) throw new Error("Profile not found");
        setProfile(res);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  useEffect(() => {
    if (!profile?.username) return;

    const fetchAds = async () => {
      try {
        const res = await apiFetch<{ results: Advertisement[] }>(
          `/api/ads/?owner_username=${profile.username}`
        );
        setAds(res.results);
      } catch (err) {
        console.error("Failed to fetch ads:", err);
      }
    };

    fetchAds();
  }, [profile?.username]);

  const submit = async () => {
    if (!accessToken || !user) {
      alert("You must be logged in to leave a review");
      return;
    }

    setLoading(true);
    try {
      console.log("Отправляем отзыв:", {
        profile: profileId,
        rating,
        comment,
      });

      await apiFetchAuth(`/api/reviews/`, {
        method: "POST",
        body: JSON.stringify({
          profile: profileId,
          rating,
          comment,
        }),
      });


      setComment("");
      setRating(5);
      alert("✅ Review added successfully!");
      router.push(`/reviews/${profile?.id}`)
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile)
    return <p className="text-center mt-10 text-gray-500 h-screen bg-white flex items-center justify-center">Загрузка профиля...</p>;

  if (error)
    return (
      <p className="text-center mt-10 text-red-500 font-medium">
        {error}
      </p>
    );

  if (!profile) return null;

  return (
    <div className="w-full">
      <section className="bg-white pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <div className="lg:w-1/4 ">
            <img
              src={profile.avatar || "/default-avatar.png"}
              alt="Avatar"
              className=" w-24 h-24 rounded-full object-cover border border-gray-400"
            />
            <h2 className="text-black font-bold text-2xl mt-3">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className=" flex text-gray-700 font-medium items-center text-lg py-2">            
              <svg className="mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g opacity="0.5">
                      <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="2"/>
                      <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
              </svg>
              {profile.city ? profile.city : "No city selected"}
            </p>
            <div className="flex  items-center mt-2">
              <span className="font-bold text-lg text-black mr-1">
                {profile.rating ?? "—"}
              </span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(profile.rating) ? "" : "opacity-30"}
                  />
                ))}
              </div>
              <span className="text-[#2AAEF7] ml-2 text-lg">
                {profile.reviews_count ?? 0} reviews
              </span>
            </div>
          </div>

          <div className="lg:w-3/4 lg:ml-16">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[180px] flex justify-center items-center mb-6">
              <h2 className="text-[#333333] text-2xl font-bold opacity-40">
                Your Ad Here
              </h2>
            </div>

            <h1 className="text-black font-bold text-3xl mb-4">
              Add review
            </h1>

            <div className="bg-white rounded-2xl space-y-4">

              <div>
                <label className="text-black/80 font-semibold text-lg block mb-1">Rating</label>

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition cursor-pointer"
                    >
                      <Star
                        size={28}
                        className={
                          star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              <label className="text-black/80 font-semibold text-lg block mb-1">Comment</label>

              <textarea
                placeholder="Your comment..."
                className="text-black w-full border rounded-3xl p-3 min-h-[100px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                onClick={submit}
                disabled={loading}
                className="bg-[#2AAEF7] hover:bg-[#1897dc] cursor-pointer rounded-3xl h-[40px] w-[200px] text-white font-medium flex items-center justify-center transition"
              >
                {loading ? "Sending..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
