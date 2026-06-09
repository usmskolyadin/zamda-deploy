"use client";

import { apiFetchAuth } from "@/src/shared/api/auth";
import { API_URL } from "@/src/shared/api/base";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangeEmailPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendCode = async () => {
    setLoading(true);
    setError("");

    try {
      await apiFetchAuth(`/api/email/change/request/`, {
        method: "POST",
        body: JSON.stringify({
          new_email: newEmail,
        }),
      });

      setStep("code");
      setSuccess("Code sent to new email");
    } catch (e: any) {
      setError(e?.message.detail || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError("");

    try {
      await apiFetchAuth(`/api/email/change/verify/`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      setSuccess("Email updated successfully");

      setTimeout(() => {
        router.push("/listings");
      }, 1200);
    } catch (e: any) {
      setError(e?.message.detail || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // // 3. confirm new email
  // const changeEmail = async () => {
  //   if (!newEmail.trim()) {
  //     setError("Enter new email");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     await apiFetchAuth(`/api/email/change/confirm/`, {
  //       method: "POST",
  //       body: JSON.stringify({
  //         new_email: newEmail,
  //       }),
  //     });

  //     setSuccess("Email updated successfully");

  //     setTimeout(() => {
  //       router.push("/listings");
  //     }, 1200);
  //   } catch (e: any) {
  //     setError(e?.message || "Failed to change email");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

              {step === "email" && (
                <>
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email"
                    className="p-4 border rounded-3xl w-full text-black"
                  />

                  <button onClick={sendCode} className="cursor-pointer hover:opacity-80 transition mt-4 w-full bg-black text-white h-[44px] rounded-3xl">
                    Send code
                  </button>
                </>
              )}
                {step === "code" && (
                  <>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter code"
                      className="p-4 border rounded-3xl w-full text-black"
                    />

                    <button onClick={verifyCode} className="cursor-pointer hover:opacity-80 transition mt-4 w-full bg-black text-white h-[44px] rounded-3xl">
                      Confirm email
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