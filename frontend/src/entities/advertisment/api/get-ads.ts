import { apiFetch } from "@/src/shared/api/base";
import { Advertisement } from "../model/types";


export async function getAdsBySubcategory(subcategorySlug: string, sort?: string): Promise<Advertisement[]> {
  const params = new URLSearchParams();
  if (sort) params.append("ordering", sort); 

  const res = await apiFetch<{ results: Advertisement[] }>(`/api/ads/?subcategory=${subcategorySlug}&${params.toString()}`);
  return res.results;
}

export async function getAdsByCategory(
  categorySlug: string,
  ordering?: string
): Promise<Advertisement[]> {
  const params = new URLSearchParams();
  params.append("category", categorySlug);
  if (ordering) params.append("ordering", ordering);

  const data = await apiFetch<{ results: Advertisement[] }>(
    `/api/ads/?${params.toString()}`
  );

  return data.results;
}
