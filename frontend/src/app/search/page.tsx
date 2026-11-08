import { Advertisement } from "@/src/entities/advertisment/model/types";
import { API_URL } from "@/src/shared/api/base";
import StickyAdBlock from "@/src/widgets/ad/StickyBanner";
import Filters from "@/src/widgets/filters";
import SortDropdown from "@/src/widgets/sort-dropdown";
import Link from "next/link";
import ProductCard from "@/src/app/ProductCard";

type SortType = "relevance" | "price_asc" | "price_desc" | "date_desc";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function mapSortToOrdering(sort?: SortType) {
  switch (sort) {
    case "price_asc":
      return "price";
    case "price_desc":
      return "-price";
    case "date_desc":
      return "-created_at";
    default:
      return null;
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    if (key === "sort") return;

    const paramKey = key === "query" ? "search" : key;

    if (Array.isArray(value)) {
      value.forEach(v => params.append(paramKey, v));
    } else {
      params.append(paramKey, value);
    }
  });

  const ordering = mapSortToOrdering(searchParams.sort as SortType | undefined);
  if (ordering) params.append("ordering", ordering);

  const res = await fetch(`${API_URL}/api/ads/?${params.toString()}`, {
    cache: "no-store",
  });

  const data = await res.json();
  const ads: Advertisement[] = data.results || [];

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff] pt-8 ">
        <div className="max-w-screen-xl mx-auto mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-gray-500 pb-2"><Link href="/">Home</Link> / <Link href="/">Search</Link></p>
        </div>
      </section>
    <section className="bg-[#ffffff] pb-16 p-4 ">
      <div className="max-w-screen-xl lg:flex lg:items-start mx-auto px-4 sm:px-6 lg:px-12">
        <div className="lg:w-1/3 self-start">
          <Filters mobileTitle="Search results" />

            <div className="mt-6 mr-10">
              <StickyAdBlock
                page="filters"
                height={500}
              />
            </div>

        </div>
          <div className="lg:w-2/3">
            <div>
              <h1 className="hidden lg:block text-black font-bold text-3xl py-4">Search results</h1>
            </div>
            <SortDropdown />
              <div className="mt-4">
            {ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
                <img
                src="/not_found.png" 
                alt="No ads available"
                className="w-56 h-56 object-contain"
                />
            <p className="text-black text-3xl font-bold text-center">
                There are no ads in this category yet
            </p>
            <p className="text-black text-xl font-medium text-center mt-2">
                They will appear soon. In the meantime, you can search for something else or post your own.
            </p>
            </div>
            ) : (
              <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
                {ads.map((ad) => (
                  <ProductCard key={ad.id} ad={ad} />
                ))}
              </div>
            )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
