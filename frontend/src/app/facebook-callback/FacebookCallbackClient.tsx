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

        const data = await res.json();

        if (!res.ok || !data.access) {
          router.replace(state || "/login");
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
  }, [searchParams]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      Facebook authentication...
    </div>
  );
}