"use client";

import { apiFetchAuth } from "@/src/shared/api/auth";
import { API_URL } from "@/src/shared/api/base";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "verify" | "new_email";

export default function ChangeEmailPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("verify");
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. отправка кода на старый email (JWT-authenticated)
  const sendCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiFetchAuth(`api/email/change/request/`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      setSuccess("Code sent to your current email");
      setStep("verify");
    } catch (e: any) {
      setError(e?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // 2. verify code
  const verifyCode = async () => {
    if (!code.trim()) {
      setError("Enter verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetchAuth(`api/email/change/verify/`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      setStep("new_email");
      setSuccess("Code verified. Enter new email.");
    } catch (e: any) {
      setError(e?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // 3. confirm new email
  const changeEmail = async () => {
    if (!newEmail.trim()) {
      setError("Enter new email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetchAuth(`api/email/change/confirm/`, {
        method: "POST",
        body: JSON.stringify({
          new_email: newEmail,
        }),
      });

      setSuccess("Email updated successfully");

      setTimeout(() => {
        router.push("/listings");
      }, 1200);
    } catch (e: any) {
      setError(e?.message || "Failed to change email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <section className="bg-white pt-8 p-4">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-12">
          <p className="text-gray-500 pb-2">
            <Link href="/">Home</Link> / Change email
          </p>

          <h1 className="text-black font-bold text-4xl py-4 text-center">
            Change email
          </h1>
        </div>
      </section>

      <section className="bg-white pb-16 p-4 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-12">
          <div className="mx-auto lg:w-96 w-full">

            {/* STEP 1 */}
            {step === "verify" && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Click below to send a verification code to your current email
                </p>

                <button
                  onClick={sendCode}
                  disabled={loading}
                  className="bg-black w-full h-[44px] rounded-3xl text-white"
                >
                  {loading ? "Sending..." : "Send code"}
                </button>

                <input
                  className="p-4 border text-black border-black rounded-3xl h-[44px] w-full mt-4"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <button
                  onClick={verifyCode}
                  className="mt-4 bg-black w-full h-[44px] rounded-3xl text-white"
                >
                  Verify code
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === "new_email" && (
              <>
                <input
                  className="p-4 border text-black border-black rounded-3xl h-[44px] w-full mt-2"
                  placeholder="New email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />

                <button
                  onClick={changeEmail}
                  disabled={loading}
                  className="mt-4 bg-black w-full h-[44px] rounded-3xl text-white"
                >
                  {loading ? "Saving..." : "Change email"}
                </button>
              </>
            )}

            {error && (
              <p className="text-red-500 mt-3 text-center">{error}</p>
            )}

            {success && (
              <p className="text-green-600 mt-3 text-center">{success}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}