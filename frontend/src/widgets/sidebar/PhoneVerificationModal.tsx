"use client";

import { useState } from "react";

import { apiFetchAuth } from "@/src/shared/api/auth.client";

type Props = {
  open: boolean;
  onClose: () => void;
  refreshUser: () => Promise<void>;
};

export default function PhoneVerificationModal({
  open,
  onClose,
  refreshUser,
}: Props) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const normalizeE164 = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 15);

    return digits ? `+${digits}` : "";
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPhone(normalizeE164(e.target.value));
  };

  const isValidE164 = (phone: string) => {
    return /^\+[1-9]\d{7,14}$/.test(phone);
    };

const sendCode = async () => {
  try {
    setError("");

    if (!isValidE164(phone)) {
      setError("Enter valid phone number");
      return;
    }

    setLoading(true);

    await apiFetchAuth("/api/verification/phone/send/", {
      method: "POST",
      body: JSON.stringify({
        phone,
      }),
    });

    setStep("code");

  } catch (err: any) {
    console.error(err);

    setError(
      err?.message ||
      "Failed to send verification code"
    );

  } finally {
    setLoading(false);
  }
};
const verifyCode = async () => {
  try {
    setError("");

    setLoading(true);

    await apiFetchAuth("/api/verification/phone/check/", {
      method: "POST",
      body: JSON.stringify({
        phone,
        code,
      }),
    });

    await refreshUser();

    onClose();

  } catch (err: any) {
    console.error(err);

    setError(
      err?.message ||
      "Invalid verification code"
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-4xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4">
          Phone verification
        </h2>

        {step === "phone" ? (
          <>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+19165551234"
              maxLength={16}
              className={`w-full rounded-2xl px-4 py-3 text-black border ${
              error
                ? "border-red-500"
                : phone.length > 0
                  ? isValidE164(phone)
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-gray-300"
            }`}
            />
            {
                error && (
                  <p className="text-red-500 text-sm mt-2">
                    {error}
                  </p>
                )
              }
            <button
              disabled={loading || !isValidE164(phone)}
              onClick={sendCode}
              className="w-full mt-4 bg-blue-400 cursor-pointer text-white py-3 rounded-3xl hover:bg-blue-600 transition disabled:opacity-50"
            >
              Send code
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-black"
            />
            {
                error && (
                  <p className="text-red-500 text-sm mt-2">
                    {error}
                  </p>
                )
              }
            <button
              disabled={loading || code.length !== 6}
              onClick={verifyCode}
              className="w-full mt-4 cursor-pointer bg-green-400 text-white py-3 rounded-3xl hover:bg-green-600 transition disabled:opacity-50"
            >
              Verify
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full cursor-pointer mt-3 border border-gray-300 py-3 rounded-3xl text-black"
        >
          Close
        </button>
      </div>
    </div>
  );
}