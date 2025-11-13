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
        setError("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  // Загружаем объявления пользователя
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

  // Отображение состояния загрузки или ошибки
  if (loading && !profile)
    return <p className="text-center mt-10 text-gray-500">Загрузка профиля...</p>;

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
          {/* Левая часть — профиль */}
          <div className="lg:w-1/4 text-center">
            <img
              src={profile.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="mx-auto w-40 h-40 rounded-full object-cover border border-gray-400"
            />
            <h2 className="text-black font-bold text-2xl mt-3">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-700 mt-1">@{profile.username}</p>
            <p className="text-gray-500">{profile.city}</p>

            <div className="flex justify-center items-center mt-2">
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
              <span className="text-[#2AAEF7] ml-2 text-sm">
                {profile.reviews_count ?? 0} отзывов
              </span>
            </div>
          </div>

          {/* Правая часть — добавление отзыва */}
          <div className="lg:w-3/4 lg:ml-16">
            <div className="rounded-3xl w-full bg-[#F2F1F0] h-[180px] flex justify-center items-center mb-6">
              <h2 className="text-[#333333] text-2xl font-bold opacity-40">
                Your Ad Here
              </h2>
            </div>

            <h1 className="text-black font-bold text-3xl mb-4">
              Добавить отзыв
            </h1>

            <div className="bg-white shadow-md rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-black font-medium">Оценка:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="ml-2 text-black border rounded-full px-2 py-1"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="Ваш комментарий..."
                className="text-black w-full border rounded-2xl p-2 min-h-[100px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                onClick={submit}
                disabled={loading}
                className="bg-[#2AAEF7] hover:bg-[#1897dc] rounded-3xl h-[40px] w-[200px] text-white font-medium flex items-center justify-center transition"
              >
                {loading ? "Отправка..." : "Отправить отзыв"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
