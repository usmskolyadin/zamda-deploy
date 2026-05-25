"use client";

import { useEffect } from "react";

export default function FacebookCallbackPage() {

  useEffect(() => {

    const hash = window.location.hash;

    const params = new URLSearchParams(
      hash.replace("#", "")
    );

    const accessToken = params.get("access_token");

    if (accessToken && window.opener) {

      window.opener.postMessage(
        {
          type: "facebook-auth",
          access_token: accessToken,
        },
        window.location.origin
      );

      window.close();
    }

  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      Facebook verification...
    </div>
  );
}