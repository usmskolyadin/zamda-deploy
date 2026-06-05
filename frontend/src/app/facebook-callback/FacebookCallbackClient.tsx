"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";
import { useAuth } from "@/src/features/context/auth-context";

export default function FacebookCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    console.log("FACEBOOK CODE:", code);
    
    if (!code) {
      router.replace(state || "/login");
      return;
    }

    const exchange = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/facebook/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const raw = await res.text();

        console.log("RAW FB RESPONSE:", raw);

        let data;
        try {
          data = JSON.parse(raw);
        } catch (e) {
          console.error("NOT JSON RESPONSE:", raw);
          router.replace(state || "/login");
          return;
        }

        console.log("PARSED DATA:", data);

        if (!res.ok) {
          console.error("FB BACKEND ERROR:", data);
          // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
          if (data.stage === "need_email") {
            // Перенаправляем на страницу завершения регистрации, передавая facebook_id и name
            const redirectPath = `/facebook-callback/complete-registration?facebook_id=${data.facebook_id}&name=${encodeURIComponent(data.name || '')}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
            router.replace(redirectPath);
          } else {
            router.replace(state || "/login");
          }
          // ----------------------
          return;
        }
          console.log("FB LOGIN RESPONSE:", data);
          console.log("ACCESS TOKEN:", data.access);
        await login(data.access, data.refresh, data.user);

        router.replace(state || "/listings");

      } catch (err) {
        console.error(err);
        router.replace(state || "/login");
      }
    };

    exchange();
  }, [searchParams, router, login]); // Добавляем зависимости для useEffect

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      Facebook authentication...
    </div>
  );
}
