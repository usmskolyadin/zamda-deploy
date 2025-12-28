"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/features/context/auth-context";
import { API_URL } from "@/src/shared/api/base";

export default function GoogleCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      router.push("/login");
      return;
    }

    const handleGoogleLogin = async () => {
      try {
        const tokenRes = await fetch(`${API_URL}api/auth/google/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!tokenRes.ok) {
          const errData = await tokenRes.json();
          console.error("Google token error:", errData);
          setError(errData.detail || "Google login failed");
          router.push("/login");
          return;
        }

        const tokenData = await tokenRes.json();
        const access = tokenData.access;
        const refresh = tokenData.refresh;

        const userRes = await fetch(`${API_URL}api/users/me/`, {
          headers: { Authorization: `Bearer ${access}` },
        });

        if (!userRes.ok) {
          const errData = await userRes.json();
          console.error("Fetch user profile error:", errData);
          setError(errData.detail || "Failed to fetch user info");
          router.push("/login");
          return;
        }

        const userData = await userRes.json();

        login(access, refresh, userData);

        router.push("/listings");
      } catch (err) {
        console.error("Google login error:", err);
        setError("Network or server error during Google login");
        router.push("/login");
      }
    };

    handleGoogleLogin();
  }, [params, router, login]);

  return <p className="bg-white h-screen flex items-center justify-center text-black">Signing in with Google…</p>;
}
