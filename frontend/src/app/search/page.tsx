import { Advertisement } from "@/src/entities/advertisment/model/types";
import { API_URL } from "@/src/shared/api/base";
import Filters from "@/src/widgets/filters";
import SortDropdown from "@/src/widgets/sort-dropdown";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

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

  // ✅ прокидываем ВСЕ параметры
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    if (key === "sort") return; // sort обрабатываем отдельно

    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else {
      params.append(key, value);
    }
  });

  // ✅ сортировка
  const ordering = mapSortToOrdering(searchParams.sort as SortType | undefined);
  if (ordering) params.append("ordering", ordering);

  const res = await fetch(`${API_URL}/api/ads/?${params.toString()}`, {
    cache: "no-store",
  });

  const data = await res.json();
  const ads: Advertisement[] = data.results || [];

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2"><Link href="/">Home</Link> / <Link href="/">Search</Link></p>
        </div>
      </section>
      <section className="bg-[#ffffff]  pb-16  p-4">
        <div className="max-w-screen-xl  lg:flex mx-auto">
          <div className="lg:w-1/3">
            <Filters />
          </div>
          <div className="lg:w-2/3">
            <div>
              <h1 className="text-black font-bold text-3xl py-4">Search results</h1>
              <div className="grid md:grid-cols-3 grid-cols-2 ">
              </div>
            </div>
            <SortDropdown />
              <div className="mt-4">
            {ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
                <img
                src="/not_found.png" 
                alt="No ads available"
                className="w-86 h-86 object-contain"
                />
            <p className="text-black text-3xl font-bold text-center">
                There are no ads in this category yet
            </p>
            <p className="text-black text-xl font-medium text-center mt-2">
                They will appear soon. In the meantime, you can search for something else or post your own.
            </p>

            </div>
            ) : (
                ads.map((ad) => (
                    <div key={ad.id} className="bg-[#F2F1F0] rounded-2xl hover:opacity-70 transition p-4 lg:flex mt-3">
                      <div className="lg:w-1/3">
                        <div className="relative">
                          <img
                            src={ad.images[0]?.image || "/placeholder.png"}
                            alt={ad.title}
                            width={200}
                            height={150}
                            className="rounded-xl object-cover w-full max-h-40"
                          />
                        </div>
                        <div className="flex gap-2 mt-2 mr-2">
                          {ad.images.slice(0, 2).map((img) => (
                            <img
                              key={img.id}
                              className="rounded-2xl max-h-24 w-1/2 object-cover"
                              src={img.image}
                              width={900}
                              height={600}
                              alt={ad.title}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="lg:w-2/3 lg:pl-4 lg:mt-0 mt-2 flex flex-col justify-between">
                        <Link
                          key={ad.id}
                          href={`/${params.category_name}/${params.subcategory_name}/${ad.slug}`}
                        >
                       <div>
                          <h3 className="lg:text-xl text-2xl font-bold text-[#2AAEF7]">
                            {ad.title}
                          </h3>
                          <p className="text-black font-semibold lg:text-lg text-xl">
                            ${ad.price}
                          </p>
                          <p className="text-gray-900 font-medium  break-words overflow-hidden line-clamp-3 leading-snug">
                            {ad.description.length > 200
                              ? ad.description.slice(0, 200) + "..."
                              : ad.description}
                          </p>
                        </div>
                        </Link>

                        <div className="flex items-center mt-2 font-medium text-gray-800">
                          <svg className="mr-1" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.03125 8.91703L19.5079 4.58356C19.8834 4.47843 20.2293 4.8244 20.1242 5.19986L15.7907 20.6765C15.6641 21.1286 15.0406 21.1728 14.8516 20.7431L11.6033 13.3607C11.553 13.2462 11.4615 13.1548 11.347 13.1044L3.9647 9.85617C3.535 9.66711 3.57919 9.04361 4.03125 8.91703Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{ad.location}</span>
                        </div>
                        <div className="max-w-[712px]">
                          <div className="flex items-center border-gray-300 py-3">
                            <img
                              src={`${ad.owner?.profile?.avatar}`}
                              width={200}
                              height={200}
                              alt=""
                              className="lg:w-10 w-15 mr-2 lg:h-10 h-15 rounded-full object-cover border border-gray-500"
                            />
                            <div>
                               <Link href={`/profile/${ad.owner_profile_id}`}>
                                  <h2 className="text-black font-bold lg:text-lg text-lg">
                                    {ad.owner?.first_name} {ad.owner?.last_name}
                                  </h2>
                                  <div className="flex items-center text-sm text-gray-700">
                                    <span className="mr-1 text-black text-md font-bold">{ad.owner.profile?.rating}</span>
                                    <div className="flex text-yellow-400 mr-1">
                                      {[...Array(4)].map((_, i) => (
                                        <FaStar key={i} />
                                      ))}
                                      <FaStar className="opacity-50" />
                                    </div>
                                    <p
                                      className="text-[#2AAEF7] text-md ml-1 hover:underline"
                                    >
                                      {ad.owner.profile?.reviews_count} reviews
                                    </p>
                                  </div>
                               </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))
            )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
