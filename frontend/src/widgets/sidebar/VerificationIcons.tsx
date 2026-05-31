"use client";

import { useEffect, useState } from "react";

import {
  FaGoogle,
  FaFacebook,
  FaPhone,
  FaCheckCircle,
} from "react-icons/fa";

import { apiFetchAuth } from "@/src/shared/api/auth.client";

import PhoneVerificationModal from "./PhoneVerificationModal";

type Props = {
  user: any;
  refreshUser: () => Promise<void>;
};

export default function VerificationIcons({
  user,
  refreshUser,
}: Props) {

  const [phoneModal, setPhoneModal] = useState(false);

  const verification = user?.verification;
  console.log("Verification status:", user?.verification);

  useEffect(() => {

    const handler = async (event: MessageEvent) => {

      if (event.data?.type !== "facebook-auth") return;

      try {

        await apiFetchAuth("/api/verification/facebook/", {
          method: "POST",
          body: JSON.stringify({
            access_token: event.data.access_token,
          }),
        });

        await refreshUser();

      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };

  }, [refreshUser]);

  const connectFacebook = async () => {

    try {

      const width = 600;
      const height = 700;

      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const url =
        `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}` +
        `&redirect_uri=${process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI}` +
        `&response_type=token` +
        `&scope=email,public_profile`;

      window.open(
        url,
        "facebook-login",
        `width=${width},height=${height},top=${top},left=${left}`
      );

    } catch (err) {
      console.error(err);
    }
  };

  const googleLogin = () => {
    const currentState = window.location.pathname + window.location.search;

    const params = new URLSearchParams({
      client_id: `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`,
      redirect_uri: `${process.env.NEXT_PUBLIC_MAIN_URL}/auth/google/callback`,
      response_type: "code",
      scope: "email profile",
      prompt: "select_account",
      state: currentState,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <>
      <div className="flex items-center gap-4 mt-2">

        <button
          onClick={googleLogin}
          title={
            verification?.google_verified
              ? "Google verified"
              : "Verify with Google"
          }
          className={`
            relative
            transition
            hover:scale-110
            cursor-pointer
            ${verification?.google_verified
              ? "text-green-500"
              : "text-gray-400 hover:text-black"
            }
          `}
        >
          <FaGoogle size={24} />

          {verification?.google_verified && (
            <FaCheckCircle
              className="
                absolute
                -bottom-1
                -right-1
                bg-white
                rounded-full
              "
              size={14}
            />
          )}
        </button>

        <button
          onClick={connectFacebook}
          title={
            verification?.facebook_verified
              ? "Facebook verified"
              : "Verify with Facebook"
          }
          className={`
            relative
            transition
            hover:scale-110
            cursor-pointer
            ${verification?.facebook_verified
              ? "text-green-500"
              : "text-gray-400 hover:text-black"
            }
          `}
        >
          <FaFacebook size={24} />

          {verification?.facebook_verified && (
            <FaCheckCircle
              className="
                absolute
                -bottom-1
                -right-1
                bg-white
                rounded-full
              "
              size={14}
            />
          )}
        </button>

        {/* PHONE */}
        <button
          onClick={() => setPhoneModal(true)}
          title={
            verification?.phone_verified
              ? "Phone verified"
              : "Verify phone"
          }
          className={`
            relative
            transition
            hover:scale-110
            cursor-pointer
            ${verification?.phone_verified
              ? "text-green-500"
              : "text-gray-400 hover:text-black"
            }
          `}
        >
          <FaPhone size={24} />

          {verification?.phone_verified && (
            <FaCheckCircle
              className="
                absolute
                -bottom-1
                -right-1
                bg-white
                rounded-full
              "
              size={14}
            />
          )}
        </button>

      </div>

      <PhoneVerificationModal
        open={phoneModal}
        onClose={() => setPhoneModal(false)}
        refreshUser={refreshUser}
        onVerified={() => setPhoneModal(false)}
      />
    </>
  );
}