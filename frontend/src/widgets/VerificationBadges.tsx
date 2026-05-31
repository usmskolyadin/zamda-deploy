"use client";

import { FaGoogle, FaFacebook, FaPhone, FaCheckCircle } from "react-icons/fa";

export type VerificationStatus = {
  google_verified?: boolean;
  facebook_verified?: boolean;
  phone_verified?: boolean;
};

interface VerificationBadgesProps {
  verification?: VerificationStatus | null;
  className?: string;
}

const badges = [
  {
    key: "google",
    label: "Google",
    icon: FaGoogle,
    colorClass: "bg-gradient-to-r from-[#4285F4] via-[#DB4437] to-[#F4B400] text-transparent bg-clip-text",
    defaultClass: "text-gray-400",
    getVerified: (verification?: VerificationStatus | null) => Boolean(verification?.google_verified),
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    colorClass: "text-[#1877F2]",
    defaultClass: "text-gray-400",
    getVerified: (verification?: VerificationStatus | null) => Boolean(verification?.facebook_verified),
  },
  {
    key: "phone",
    label: "Phone",
    icon: FaPhone,
    colorClass: "text-[#22C55E]",
    defaultClass: "text-gray-400",
    getVerified: (verification?: VerificationStatus | null) => Boolean(verification?.phone_verified),
  },
];

export default function VerificationBadges({ verification, className = "" }: VerificationBadgesProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {badges.map((badge) => {
        const Icon = badge.icon;
        const verified = badge.getVerified(verification);

        return (
          <div key={badge.key} className="relative">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm ${
                verified ? "ring-1 ring-green-400" : ""
              }`}
              title={`${badge.label} verification ${verified ? "verified" : "not verified"}`}
            >
              <Icon
                className={`text-xl ${verified ? badge.colorClass : badge.defaultClass}`}
              />
            </div>

            {verified && (
              <FaCheckCircle
                className="absolute -bottom-1 -right-1 text-green-500 bg-white rounded-full"
                size={14}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
