import { apiFetch } from "@/src/shared/api/base";
import { Category } from "@/src/entities/category/model/types";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiFetch<PaginatedResponse<Category>>("/api/categories/");
  return data.results;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const category = await apiFetch<Category>(`/api/categories/${slug}/`);
  return category;
}