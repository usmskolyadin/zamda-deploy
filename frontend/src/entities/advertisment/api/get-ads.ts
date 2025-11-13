import { apiFetch } from "@/src/shared/api/base";
import { Advertisement } from "../model/types";


export async function getAdsBySubcategory(subcategorySlug: string): Promise<Advertisement[]> {
  const res = await apiFetch<{ results: Advertisement[] }>(`/api/ads/?subcategory=${subcategorySlug}`);
  console.log(`ADS BY SUBCATEGORY`, JSON.stringify(res.results, null, 2))
  return res.results;
}