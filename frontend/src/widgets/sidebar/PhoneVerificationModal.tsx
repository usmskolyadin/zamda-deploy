"use client";

import { useState } from "react";

import { apiFetch } from "@/src/shared/api/base";
import { apiFetchAuth } from "@/src/shared/api/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
  refreshUser?: () => Promise<void>;
};

export default function PhoneVerificationModal({
  open,
  onClose,
  onVerified,
  refreshUser,
}: Props) {

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // ONLY 10 US DIGITS
  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const digits = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setPhone(digits);
  };

  // FORMAT: (XXX) XXX-XXXX
  const formatPhone = (digits: string) => {

    const cleaned = digits.replace(/\D/g, "");

    if (cleaned.length <= 3) {
      return cleaned;
    }

    if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }

    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // FORCE +1
  const fullPhone = `+1${phone}`;

  const isValidUSPhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  const sendCode = async () => {

    try {

      setError("");

      if (!isValidUSPhone(phone)) {
        setError("Enter valid US phone number");
        return;
      }

      setLoading(true);

      await apiFetchAuth(
        "/api/verification/phone/send/",
        {
          method: "POST",
          body: JSON.stringify({
            phone: fullPhone,
          }),
        }
      );

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

      await apiFetchAuth(
        "/api/verification/phone/check/",
        {
          method: "POST",
          body: JSON.stringify({
            phone: fullPhone,
            code,
          }),
        }
      );

      if (refreshUser) {
        await refreshUser();
      }

      onVerified(fullPhone);
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

            <div
              className={`flex items-center rounded-4xl border overflow-hidden ${
                error
                  ? "border-red-500"
                  : phone.length > 0
                    ? isValidUSPhone(phone)
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-gray-300"
              }`}
            >

              {/* FIXED +1 */}
              <div className="px-4 py-3 bg-gray-100 text-black font-medium border-r border-gray-300 select-none">
                +1
              </div>

              <input
                type="tel"
                value={formatPhone(phone)}
                onChange={handlePhoneChange}
                placeholder="(916) 555-1234"
                inputMode="numeric"
                className="w-full px-4 py-3 text-black outline-none"
              />

            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2">
                {error}
              </p>
            )}

            <p className="text-xs text-center text-gray-800 mt-3 leading-relaxed">
              We only accept North American phone numbers for verification to ensure marketplace safety.
            </p>

            <button
              disabled={
                loading ||
                !isValidUSPhone(phone)
              }
              onClick={sendCode}
              className="w-full mt-4 bg-blue-400 cursor-pointer text-white py-3 rounded-3xl hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send code"}
            </button>

          </>
        ) : (
          <>

            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              className={`w-full rounded-4xl px-4 py-3 text-black border ${
                error
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {error && (
              <p className="text-red-500 text-sm mt-2">
                {error}
              </p>
            )}

            <button
              disabled={
                loading ||
                code.length !== 6
              }
              onClick={verifyCode}
              className="w-full mt-4 cursor-pointer bg-green-400 text-white py-3 rounded-3xl hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Verify"}
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