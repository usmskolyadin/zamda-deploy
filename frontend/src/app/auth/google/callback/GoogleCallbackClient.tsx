"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { API_URL } from "@/src/shared/api/base";

export default function GoogleCallbackClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("code");

    const handleGoogleLogin = async () => {
      try {
        const tokenRes = await fetch(`${API_URL}/api/auth/google/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const { access, refresh } = await tokenRes.json();

        const userRes = await fetch(`${API_URL}/api/users/me/`, {
          headers: { Authorization: `Bearer ${access}` },
        });

        const userData = await userRes.json();

        login(access, refresh, userData);
        router.replace("/listings");
      } catch {
        router.replace("/login");
      }
    };

    handleGoogleLogin();
  }, [params, router, login]);

  return (
    <p className="bg-white h-screen flex items-center justify-center text-black">
      Signing in with Google…
    </p>
  );
}
