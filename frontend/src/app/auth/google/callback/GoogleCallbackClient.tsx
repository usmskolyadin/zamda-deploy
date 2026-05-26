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
    const code = params?.get("code");
    const state = params?.get("state");

    if (!code) {
      router.replace(state || "/login");
      return;
    }

  const handleGoogleLogin = async () => {
    try {
      const tokenRes = await fetch(`${API_URL}/api/auth/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!tokenRes.ok) {
        throw new Error("Google auth failed");
      }

      const tokenData = await tokenRes.json();

      if (!tokenData.access) {
        throw new Error("No access token");
      }

      const userRes = await fetch(`${API_URL}/api/users/me/`, {
        headers: {
          Authorization: `Bearer ${tokenData.access}`,
        },
      });

      if (!userRes.ok) {
        throw new Error("User fetch failed");
      }

      const userData = await userRes.json();

      await login(tokenData.access, tokenData.refresh, userData);

      // Redirect back to the originating page if provided via `state`,
      // otherwise fall back to the listings page.
      window.location.replace(state || "/listings");
    } catch (err) {
      console.error(err);
      router.replace(state || "/login");
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
