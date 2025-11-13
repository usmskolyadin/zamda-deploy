import { getAdsBySubcategory } from "@/src/entities/advertisment/api/get-ads";
import { Advertisement } from "@/src/entities/advertisment/model/types";
import { getSubCategories } from "@/src/entities/sub-category/api/get-subcategories";
import Filters from "@/src/widgets/filters";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowRight, FaStar } from "react-icons/fa";


interface Props {
  params: { category_name: string; subcategory_name: string };
}

export default async function AdsBySubcategory({ params }: Props) {
  const subcategories = await getSubCategories(params.category_name);

  const subcategory = subcategories.find(
    (sub) => sub.slug === params.subcategory_name
  );
  
  if (!subcategory) {
    notFound();
  }

  const ads = await getAdsBySubcategory(subcategory.slug);

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2"><Link href="/">Home</Link> / <Link href="/">{params.category_name}</Link> / <Link href="/">{subcategory.name}</Link></p>
          <h1 className="text-black font-bold text-4xl py-4">{subcategory.name}</h1>
        </div>
      </section>
      <section className="bg-[#ffffff]  pb-16 p-4">
        <div className="max-w-screen-xl lg:flex mx-auto">
          <Filters />
          <div className=" lg:w-2/3">
            <div>
              <h1 className="text-black font-bold text-3xl py-4">Popular "{subcategory.name}"</h1>
            </div>
            <div className="rounded-3xl  w-full bg-[#F2F1F0] h-[200px] mt-6 flex justify-center items-center">
              <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
            </div>
            <div className="mt-4 py-2 flex items-center cursor-pointer">
                    <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <path d="M14 10H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 14H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 18H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 6H2" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 10V20M19 20L22 17M19 20L16 17" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                    </svg>
                    <p className="text-[#333333] mr-2">Sort by</p>
                    <svg width="17" height="10" viewBox="0 0 17 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.5" d="M1.45898 0.708984L8.70888 7.95889L15.9588 0.708984" stroke="#333333" strokeWidth="2"/>
                    </svg>
                </div>
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
                          <div className="absolute top-2 right-2  bg-black/30 p-2 rounded-full">
                            <svg width="24" height="24" className="invert" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
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
