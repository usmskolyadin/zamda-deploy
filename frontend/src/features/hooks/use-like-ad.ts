"use client";

import { API_URL } from "@/src/shared/api/base";
import useSWR from "swr";
import { useRouter } from "next/navigation";

export function useLikeAd(adSlug: string | undefined, token: string | null) {
  const router = useRouter()

  const fetcher = (url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

  const { data, mutate, isLoading } = useSWR(
    adSlug && token ? `${API_URL}/api/ads/${adSlug}/` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const toggleLike = async () => {
    if (!adSlug) return;
    if (!token) return router.push("/login")

    if (!data) return; 

    mutate(
      {
        ...data,
        is_liked: !data.is_liked,
        likes_count: data.likes_count + (data.is_liked ? -1 : 1),
      },
      false
    );

    try {
      const res = await fetch(`${API_URL}/api/ads/${adSlug}/like/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = await res.json();

      // обновляем с сервера
      mutate(
        {
          ...data,
          is_liked: updated.detail === "Liked",
          likes_count: updated.likes_count,
        },
        false
      );
    } catch (err) {
      console.error("Failed to like ad:", err);
      // откат в случае ошибки
      mutate(data, false);
    }
  };

  return {
    isLiked: data?.is_liked,
    likesCount: data?.likes_count,
    toggleLike,
    loading: isLoading,
  };
}
