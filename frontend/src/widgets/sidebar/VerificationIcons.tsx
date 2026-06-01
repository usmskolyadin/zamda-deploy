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
              ? "text-red-500"
              : "text-gray-400 hover:text-black"
            }
          `}
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width={28}
              height={28}
            >
            <defs>
              <path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              </defs>
              
              <clipPath id="b"><use href="#a" overflow="visible"/></clipPath>
                <path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/>
                <path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/>
                <path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/>
                <path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/>
            </svg>

          {verification?.google_verified && (
            <FaCheckCircle
              className="
                absolute
                -bottom-1
                -right-1
                bg-white
                text-green-500
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
              ? "text-blue-500"
              : "text-gray-400 hover:text-black"
            }
          `}
        >
          <FaFacebook size={28} />

          {verification?.facebook_verified && (
            <FaCheckCircle
              className="
                absolute
                -bottom-1
                -right-1
                bg-white
                text-green-500
                rounded-full
              "
              size={14}
            />
          )}
        </button>

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
          <FaPhone size={28} />

          {verification?.phone_verified && (
            <FaCheckCircle
              className="
                absolute
                -bottom-1
                -right-1
                text-green-500
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