import { Suspense } from "react";
import FacebookCallbackClient from "./FacebookCallbackClient";

export default function Page() {
  return (
    <Suspense fallback={
      <p className="bg-white h-screen flex items-center justify-center text-black">
        Signing in with Facebook…
      </p>
    }>
      <FacebookCallbackClient />
    </Suspense>
  );
}
