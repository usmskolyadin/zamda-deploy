"use client";

import { useId } from "react";
import {
  FaGoogle,
  FaFacebook,
  FaPhone,
  FaCheckCircle,
} from "react-icons/fa";


const GoogleIcon = ({
  size = 28,
  verified = false,
}: {
  size?: number;
  verified?: boolean;
}) => {
  const id = useId();

  const pathId = `${id}-path`;
  const clipId = `${id}-clip`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={!verified ? "grayscale opacity-70" : ""}
    >
      <defs>
        <path
          id={pathId}
          d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
        />
      </defs>

      <clipPath id={clipId}>
        <use href={`#${pathId}`} />
      </clipPath>

      <path
        clipPath={`url(#${clipId})`}
        fill="#FBBC05"
        d="M0 37V11l17 13z"
      />
      <path
        clipPath={`url(#${clipId})`}
        fill="#EA4335"
        d="M0 11l17 13 7-6.1L48 14V0H0z"
      />
      <path
        clipPath={`url(#${clipId})`}
        fill="#34A853"
        d="M0 37l30-23 7.9 1L48 0v48H0z"
      />
      <path
        clipPath={`url(#${clipId})`}
        fill="#4285F4"
        d="M48 48L17 24l-4-3 35-10z"
      />
    </svg>
  );
};

export type VerificationStatus = {
  google_verified?: boolean;
  facebook_verified?: boolean;
  phone_verified?: boolean;
};

interface VerificationBadgesProps {
  verification?: VerificationStatus | null;
  googleUrl?: string | null;
  facebookUrl?: string | null;
  phoneUrl?: string | null;
  className?: string;
}

const badges = [
  {
    key: "google",
    label: "Google",
    icon: GoogleIcon,
    colorClass: "text-[#EA4335]",
    getVerified: (v?: VerificationStatus | null) =>
      Boolean(v?.google_verified),
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    colorClass: "text-[#1877F2]",
    getVerified: (v?: VerificationStatus | null) =>
      Boolean(v?.facebook_verified),
  },
  {
    key: "phone",
    label: "Phone",
    icon: FaPhone,
    colorClass: "text-[#22C55E]",
    getVerified: (v?: VerificationStatus | null) =>
      Boolean(v?.phone_verified),
  },
];

export default function VerificationBadges({
  verification,
  googleUrl,
  facebookUrl,
  phoneUrl,
  className = "",
}: VerificationBadgesProps) {
  const links = {
    google: googleUrl,
    facebook: facebookUrl,
    phone: phoneUrl,
  };

  return (
  <div className={`flex flex-col gap-3 ${className}`}>
    {badges.map((badge) => {
      const verified = badge.getVerified(verification);
      const Icon = badge.icon;
      const href = links[badge.key as keyof typeof links];

      const clickable = verified && href;

      return (
        <button
          key={badge.key}
          type="button"
          title={
            verified
              ? `Open ${badge.label} profile`
              : `${badge.label} not verified`
          }
          onClick={() => {
            if (clickable) {
              window.open(
                href!,
                "_blank",
                "noopener,noreferrer"
              );
            }
          }}
          className={`
            flex items-center gap-3
            transition bg-gray-100 rounded-2xl px-4 py-2.5
            ${
              clickable
                ? "cursor-pointer hover:opacity-80"
                : "cursor-default"
            }
          `}
        >
          {/* Иконка + галочка */}
          <div className="relative">
            {badge.key === "google" ? (
              <GoogleIcon
                size={24}
                verified={verified}
              />
            ) : (
              <Icon
                size={24}
                className={
                  verified
                    ? badge.colorClass
                    : "text-gray-400"
                }
              />
            )}

            {verified && (
              <FaCheckCircle
                size={14}
                className="
                  absolute
                  -bottom-1
                  -right-1
                  bg-white
                  text-green-500
                  rounded-full
                "
              />
            )}
          </div>

          {/* Статус */}
          <span
            className={`text-sm font-medium ${
              verified
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            {verified ? "Confirmed" : "Not confirmed"}
          </span>
        </button>
      );
    })}
  </div>
);
}