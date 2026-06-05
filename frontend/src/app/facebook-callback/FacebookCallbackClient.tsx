"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";
import { useAuth } from "@/src/features/context/auth-context";

export default function FacebookCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const hasExchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    console.log("FACEBOOK CODE:", code);
    
    if (!code) {
      router.replace(state || "/login");
      return;
    }

    if (hasExchanged.current) {
      console.log("Already exchanged, skipping...");
      return;
    }

    const exchange = async () => {
      try {
        // 1. Получаем токены от Facebook через бэкенд
        const tokenRes = await fetch(`${API_URL}/api/auth/facebook/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const raw = await tokenRes.text();
        
        console.log("RAW FB RESPONSE:", raw);

        let tokenData;
        try {
          tokenData = JSON.parse(raw);
        } catch (e) {
          console.error("NOT JSON RESPONSE:", raw);
          router.replace(state || "/login");
          return;
        }

        console.log("PARSED DATA:", tokenData);

        if (!tokenRes.ok) {
          console.error("FB BACKEND ERROR:", tokenData);
          if (tokenData.stage === "need_email") {
            const redirectPath = `/facebook-callback/complete-registration?facebook_id=${tokenData.facebook_id}&name=${encodeURIComponent(tokenData.name || '')}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
            router.replace(redirectPath);
          } else {
            router.replace(state || "/login");
          }
          return;
        }
        
        console.log("FB LOGIN RESPONSE:", tokenData);
        console.log("ACCESS TOKEN:", tokenData.access);

        // 2. Проверяем, что получили access токен
        if (!tokenData.access) {
          throw new Error("No access token");
        }

        // 3. Получаем полные данные пользователя по аналогии с Google
        const userRes = await fetch(`${API_URL}/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${tokenData.access}`,
          },
        });

        if (!userRes.ok) {
          throw new Error("User fetch failed");
        }

        const userData = await userRes.json();
        console.log("USER DATA:", userData);

        // 4. Выполняем login с полученными данными
        hasExchanged.current = true;
        await login(tokenData.access, tokenData.refresh, userData);
        
        // 5. Полная перезагрузка страницы для правильной инициализации контекста
        window.location.replace(state || "/listings");
        
      } catch (err) {
        console.error(err);
        router.replace(state || "/login");
      }
    };

    exchange();
  }, [searchParams, router, login]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      Facebook authentication...
    </div>
  );
}