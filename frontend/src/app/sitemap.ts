import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function fetchAllPaginated(url: string) {
  let results: any[] = [];
  let next = url;

  while (next) {
    const res = await fetch(next, { cache: "no-store" });
    const data = await res.json();
    results = results.concat(data.results);
    next = data.next;
  }

  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/terms",
    "/help",
    "/policy",
  ].map(path => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categories = await fetch(`${API_URL}/categories/`, {
    cache: "no-store",
  }).then(res => res.json());

  const categoryRoutes = categories.results.map((cat: any) => ({
    url: `${SITE_URL}/${cat.slug}`,
    lastModified: new Date(cat.updated_at ?? Date.now()),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const ads = await fetchAllPaginated(`${API_URL}/ads/`);

  const adRoutes = ads.map((ad: any) => ({
    url: `${SITE_URL}/ads/${ad.slug}`,
    lastModified: new Date(ad.updatedAt ?? Date.now()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...adRoutes];
}
