"use client";

import { API_URL } from "@/src/shared/api/base";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "email" | "code" | "password";

export default function RestorePassword() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/password/reset/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Failed to send code");
        return;
      }

      setSuccess("Verification code sent to email");
      setStep("code");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      setError("Enter verification code");
      return;
    }

    setError("");
    setStep("password");
  };

  const resetPassword = async () => {
    if (password1 !== password2) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          new_password: password1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Failed to reset password");
        return;
      }

      setSuccess("Password updated successfully");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2">
            <Link href="/">Home</Link> / Restore password
          </p>
          <h1 className="text-black font-bold text-4xl py-4 text-center">
            Restore password
          </h1>
        </div>
      </section>

      <section className="bg-[#ffffff] pb-16 p-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex-col items-center mx-auto mt-4 lg:w-96 w-full">

            {/* STEP 1 — EMAIL */}
            {step === "email" && (
              <>
                <input
                  className="p-4 border text-black border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

                <button
                  onClick={requestCode}
                  disabled={loading || !email}
                  className="cursor-pointer transition hover:opacity-80 mt-4 bg-black w-full h-[44px] rounded-3xl text-white"
                >
                  {loading ? "Sending..." : "Send code"}
                </button>
              </>
            )}

            {/* STEP 2 — CODE */}
            {step === "code" && (
              <>
                <input
                  className="p-4 border text-black border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="Verification code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />

                <button
                  onClick={verifyCode}
                  className="cursor-pointer transition hover:opacity-80 mt-4 bg-black w-full h-[44px] rounded-3xl text-white"
                >
                  Verify code
                </button>
              </>
            )}

            {/* STEP 3 — PASSWORD */}
            {step === "password" && (
              <>
                <input
                  className="p-4 border text-black border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="New password"
                  type="password"
                  value={password1}
                  onChange={e => setPassword1(e.target.value)}
                />

                <input
                  className="p-4 border text-black border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="Repeat new password"
                  type="password"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                />

                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="cursor-pointer transition hover:opacity-80 mt-4 bg-black w-full h-[44px] rounded-3xl text-white"
                >
                  {loading ? "Saving..." : "Reset password"}
                </button>
              </>
            )}

            {error && (
              <p className="text-red-500 mt-3 text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-600 mt-3 text-center">{success}</p>
            )}

            <p className="text-black mt-6 text-center">
              Remembered your password?{" "}
              <Link className="underline" href="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
