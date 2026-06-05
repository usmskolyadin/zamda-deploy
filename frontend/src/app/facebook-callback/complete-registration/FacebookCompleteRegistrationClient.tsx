"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";
import { useAuth } from "@/src/features/context/auth-context";
import Link from "next/link";

export default function FacebookCompleteRegistrationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const facebook_id = searchParams.get("facebook_id");
  const name = searchParams.get("name");
  const state = searchParams.get("state");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!facebook_id) {
      setError("Missing Facebook ID. Please try again from the start.");
      return;
    }

    setLoading(true);
    try {
      // 1. Завершаем регистрацию и получаем токены
      const tokenRes = await fetch(`${API_URL}/api/auth/facebook/complete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebook_id,
          email,
          name: name || "",
        }),
      });

      const raw = await tokenRes.text();
      let tokenData;
      try {
        tokenData = JSON.parse(raw);
      } catch (e) {
        console.error("NOT JSON RESPONSE:", raw);
        setError("An unexpected error occurred. Please try again.");
        return;
      }

      if (!tokenRes.ok) {
        console.error("FB COMPLETE REGISTRATION BACKEND ERROR:", tokenData);
        setError(tokenData.detail || tokenData.error || "Failed to complete registration.");
        return;
      }

      console.log("FB COMPLETE REGISTRATION RESPONSE:", tokenData);
      
      // 2. Проверяем, что получили access токен
      if (!tokenData.access) {
        throw new Error("No access token");
      }

      // 3. Получаем полные данные пользователя
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
      
      // 4. Выполняем login
      await login(tokenData.access, tokenData.refresh, userData);
      
      // 5. Полная перезагрузка страницы
      window.location.replace(state || "/listings");

    } catch (err) {
      console.error(err);
      setError("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!facebook_id) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="bg-white pt-8 p-4">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-12">
          <p className="text-gray-500 pb-2">
            <Link href="/">Home</Link> / Complete Facebook Registration
          </p>

          <h1 className="text-black font-bold text-4xl py-4 text-center">
            Complete Facebook Registration
          </h1>
        </div>
      </section>

      <section className="bg-white pb-16 p-4 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-12">
          <div className="mx-auto lg:w-96 w-full">
            <p className="text-gray-700 mb-4 text-center">
              It looks like we couldn't get your email from Facebook. Please provide it to complete your registration.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                className="p-4 border text-black border-black rounded-3xl h-[44px] w-full mb-4"
                placeholder="Your Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-black w-full h-[44px] rounded-3xl text-white"
              >
                {loading ? "Completing..." : "Complete Registration"}
              </button>
            </form>

            {error && (
              <p className="text-red-500 mt-3 text-center">{error}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}