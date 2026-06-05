import { Suspense } from "react";
import FacebookCompleteRegistrationClient from "./FacebookCompleteRegistrationClient";

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="bg-white h-screen flex items-center justify-center text-black">
        <p>Loading...</p>
      </div>
    }>
      <FacebookCompleteRegistrationClient />
    </Suspense>
  );
}