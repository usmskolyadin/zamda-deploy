import { apiFetch } from "@/src/shared/api/base";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import AdPageClient from "./AdPageClient";

interface PageParams {
  category_name: string;
  subcategory_name: string;
  ad_name: string;
}

export default async function AdPage({ params }: { params: PageParams }) {
  const ad: Advertisement = await apiFetch<Advertisement>(
    `/api/ads/${params.ad_name}/`
  );
  console.log(ad)
  return <AdPageClient ad={ad} />;
}