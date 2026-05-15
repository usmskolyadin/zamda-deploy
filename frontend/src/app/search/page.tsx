import { Advertisement } from "@/src/entities/advertisment/model/types";
import { API_URL } from "@/src/shared/api/base";
import AdsBlock from "@/src/widgets/ad/AdBannerClient";
import StickyAdBlock from "@/src/widgets/ad/StickyBanner";
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
          <Filters />

            <div className="mt-6 mr-10">
              <StickyAdBlock
                page="filters"
                height={500}
              />
            </div>

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
<div
  key={ad.id}
  className="
    group
    mt-4
    overflow-hidden
    rounded-3xl
    border border-gray-200
    bg-[#F5F5F5]
    hover:bg-gray-100
    hover:shadow-md
    transition-all
    duration-200
  "
>
  <div className="lg:flex">
    
    {/* IMAGE SIDE */}
    <div className="lg:w-[340px] flex-shrink-0">
      <Link
        href={`/${params.category_name}/${params.subcategory_name}/${ad.slug}`}
      >
        <div className="relative">
          <img
            src={ad.images[0]?.image || "/placeholder.png"}
            alt={ad.title}
            width={600}
            height={400}
            className="
              h-[260px]
              lg:h-[260px]
              w-full
              object-cover
            "
          />


        </div>
      </Link>
    </div>

    {/* CONTENT */}
    <div className="flex flex-col justify-between p-5 w-full min-w-0">
      
      <div>
        {/* TOP */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/${params.category_name}/${params.subcategory_name}/${ad.slug}`}
            className="min-w-0"
          >
            <h2
              className="
                text-xl
                lg:text-xl
                font-bold
                text-black
                line-clamp-2
                group-hover:text-[#2AAEF7]
                transition
              "
            >
              {ad.title}
            </h2>
          </Link>

          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-[#2AAEF7]">
              ${Number(ad.price)}
            </p>
          </div>
        </div>

        {/* LOCATION */}
        <div className="flex items-center text-gray-600 mt-3 text-sm font-medium">
          <svg
            className="mr-2 flex-shrink-0"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4.03125 8.91703L19.5079 4.58356C19.8834 4.47843 20.2293 4.8244 20.1242 5.19986L15.7907 20.6765C15.6641 21.1286 15.0406 21.1728 14.8516 20.7431L11.6033 13.3607C11.553 13.2462 11.4615 13.1548 11.347 13.1044L3.9647 9.85617C3.535 9.66711 3.57919 9.04361 4.03125 8.91703Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="truncate">
            {ad.location}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p
          className="
            mt-4
            text-gray-700
            leading-relaxed
            lg:text-sm text-sm
            line-clamp-3
            break-words
          "
        >
          {ad.description}
        </p>
      </div>

      {/* BOTTOM */}
      <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        
        {/* OWNER */}
        <Link
          href={`/profile/${ad.owner_profile_id}`}
          className="
            flex
            items-center
            gap-3
            hover:opacity-80
            transition
            min-w-0
          "
        >
          <img
            src={ad.owner?.profile?.avatar}
            width={80}
            height={80}
            alt=""
            className="
              h-14
              w-14
              rounded-full
              object-cover
              border
              border-gray-300
              flex-shrink-0
            "
          />

          <div className="min-w-0">
            <h3 className="font-bold text-black truncate">
              {ad.owner?.first_name} {ad.owner?.last_name}
            </h3>

            <div className="flex items-center flex-wrap text-sm text-gray-600 mt-1">
              <span className="font-semibold text-black mr-2">
                {ad.owner.profile?.rating || "0.0"}
              </span>

              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(ad.owner.profile?.rating || 0)
                        ? ""
                        : "opacity-30"
                    }
                  />
                ))}
              </div>

              <span className="text-[#2AAEF7] font-medium">
                {ad.owner.profile?.reviews_count} reviews
              </span>
            </div>
          </div>
        </Link>

        {/* STATS */}
        <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
          
          <div className="flex items-center">
                    <svg className="mr-1" width="18" height="18" viewBox="0 -4 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="Dribbble-Light-Preview" transform="translate(-260.000000, -4563.000000)" fill="#000000">
                                <g id="icons" transform="translate(56.000000, 160.000000)">
                                    <path d="M216,4409.00052 C216,4410.14768 215.105,4411.07682 214,4411.07682 C212.895,4411.07682 212,4410.14768 212,4409.00052 C212,4407.85336 212.895,4406.92421 214,4406.92421 C215.105,4406.92421 216,4407.85336 216,4409.00052 M214,4412.9237 C211.011,4412.9237 208.195,4411.44744 206.399,4409.00052 C208.195,4406.55359 211.011,4405.0763 214,4405.0763 C216.989,4405.0763 219.805,4406.55359 221.601,4409.00052 C219.805,4411.44744 216.989,4412.9237 214,4412.9237 M214,4403 C209.724,4403 205.999,4405.41682 204,4409.00052 C205.999,4412.58422 209.724,4415 214,4415 C218.276,4415 222.001,4412.58422 224,4409.00052 C222.001,4405.41682 218.276,4403 214,4403" id="view_simple-[#815]">

                              </path>
                                </g>
                            </g>
                        </g>
                    </svg>

            {ad.views_count}
          </div>

          <div className="flex items-center">
                      <svg
                        width="18"
                        height="18"
                        className="mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

            {ad.likes_count}
          </div>
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
