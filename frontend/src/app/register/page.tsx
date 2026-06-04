import { Suspense } from "react";
import Register from "./Register";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Register />
    </Suspense>
  );
}