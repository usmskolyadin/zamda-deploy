import { cookies } from "next/headers";
import ListingsClient from "./page";

export default async function ListingsPage() {
  const cookieStore = cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ads/my/counts/`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store", // или revalidate: 30
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load ads counts");
  }

  const counts = await res.json();

  return <ListingsClient counts={counts} />;
}
