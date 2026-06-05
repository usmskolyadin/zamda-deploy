import { Suspense } from "react";
import FacebookCompleteRegistrationPage from "./CompleteFacebookClient";

export default function Page() {
  return (
    <Suspense>
      <FacebookCompleteRegistrationPage />
    </Suspense>
  );
}
