"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";
import { useAuth } from "@/src/features/context/auth-context";
import Link from "next/link"; // Добавим Link для навигации

export default function FacebookCompleteRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const facebook_id = searchParams.get("facebook_id");
  const name = searchParams.get("name");
  const state = searchParams.get("state");

  useEffect(() => {
    if (!facebook_id) {
      router.replace(state || "/login");
    }
  }, [facebook_id, router, state]);

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
      const res = await fetch(`${API_URL}/api/auth/facebook/complete_registration/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebook_id,
          email,
          name: name || "", // Передаем имя, если оно есть
        }),
      });

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("NOT JSON RESPONSE:", raw);
        setError("An unexpected error occurred. Please try again.");
        return;
      }

      if (!res.ok) {
        console.error("FB COMPLETE REGISTRATION BACKEND ERROR:", data);
        setError(data.detail || data.error || "Failed to complete registration.");
        return;
      }

      console.log("FB COMPLETE REGISTRATION RESPONSE:", data);
      await login(data.access, data.refresh, data.user);

      router.replace(state || "/listings"); // Перенаправляем на listings или на исходный state

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
