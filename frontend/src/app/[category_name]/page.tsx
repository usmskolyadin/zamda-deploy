import Image from "next/image";
import Link from "next/link";
import { getSubCategories } from "@/src/entities/sub-category/api/get-subcategories";
import { SubCategory } from "@/src/entities/sub-category/model/types";
import { Category } from "@/src/entities/category/model/types";
import { getCategoryBySlug } from "@/src/entities/category/api/get-categories";
import { getAdsByCategory } from "@/src/entities/advertisment/api/get-ads";
import ProductCard from "../ProductCard";
import { useAds } from "@/src/features/hooks/use-ad";
import AdsBlock from "@/src/widgets/ad/AdBannerClient";

interface Props {
  params: { category_name: string };
}

export default async function SubCategoriesPage({ params }: Props) {
  const categorySlug = params.category_name;

  const category: Category = await getCategoryBySlug(categorySlug);
  const ads = await getAdsByCategory(categorySlug);

  const subcategories: SubCategory[] = await getSubCategories(categorySlug);

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] min-h-screen pt-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 pb-8">
          <p className="text-gray-500 pb-2">
            <Link className="hover:underline" href="/">Home</Link> / <Link className="hover:underline" href={categorySlug}>{category.name}</Link>
          </p>
          <h1 className="text-black font-bold lg:text-4xl text-3xl py-4">
            {category.name}
          </h1>
          <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-2 gap-4">
            {subcategories
              .sort((a, b) => Number(b.priority) - Number(a.priority))
              .map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/${category.slug}/${subcategory.slug}`}
                  className="group"
                >
                  <div className="
                    relative overflow-hidden
                    h-[160px] md:h-[180px]
                    rounded-2xl
                    bg-gray-100
                    p-3
                  ">

                    <h2 className="
                      relative z-10
                      text-black text-sm md:text-lg font-semibold leading-tight
                      text-left
                    ">
                      {subcategory.name}
                    </h2>

                    {/* IMAGE */}
                    <img
                      src={subcategory.image || "/billie.png"}
                      alt={subcategory.name}
                      className="
                        absolute -bottom-3 -right-3
                        h-[100px] md:h-[120px] w-auto
                        object-contain
                        transition duration-300
                        group-hover:scale-105
                        pointer-events-none
                      "
                    />

                  </div>
                </Link>
              ))}
          </div>
        </div>
            <div className="bg-[#E5E9F2] min-h-screen  p-4 lg:p-0">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="max-w-screen-xl mx-auto lg:mt-12 mt-0">
                <div className="pt-4 hidden lg:block">
                  <AdsBlock page={"category"} />
                </div>
                <h1 className="text-black font-bold lg:text-4xl text-3xl py-2 lg:pt-8 pt-8 pt-0 text-center">
                  Recommended for you
                </h1>
                  {ads.length ? (
                    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4 mt-6">
                      {ads.map((ad) => (
                        <ProductCard key={ad.id} ad={ad} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 mt-6">No ads found.</p>
                  )}
             </div>
              </div>
              </div>
      </section>
    </div>
  );
}
