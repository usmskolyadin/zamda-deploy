import { Suspense } from "react";
import GoogleCallbackClient from "./GoogleCallbackClient";

export default function Page() {
  return (
    <Suspense fallback={
      <p className="bg-white h-screen flex items-center justify-center text-black">
        Signing in with Google…
      </p>
    }>
      <GoogleCallbackClient />
    </Suspense>
  );
}
