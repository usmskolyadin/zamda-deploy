import Image from "next/image";
import Link from "next/link";
import { getSubCategories } from "@/src/entities/sub-category/api/get-subcategories";
import { SubCategory } from "@/src/entities/sub-category/model/types";
import { Category } from "@/src/entities/category/model/types";
import { getCategoryBySlug } from "@/src/entities/category/api/get-categories";
import { getAdsByCategory } from "@/src/entities/advertisment/api/get-ads";
import ProductCard from "../ProductCard";

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
        <div className="max-w-screen-xl mx-auto  p-4 lg:p-0">
          <p className="text-gray-500 pb-2">
            <Link className="hover:underline" href="/">Home</Link> / <Link className="hover:underline" href={categorySlug}>{category.name}</Link>
          </p>
          <h1 className="text-black font-bold text-4xl py-4">
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
          relative h-[130px] md:h-[150px]
          rounded-2xl overflow-hidden
          shadow-[0_4px_12px_rgba(0,0,0,0.06)]
          hover:shadow-[0_6px_16px_rgba(0,0,0,0.10)]
          transition
        ">

          {/* IMAGE CONTAINER */}
          <div className="absolute inset-0  flex items-center justify-center p-3">
            <img
              src={subcategory.image || "/billie.png"}
              alt={subcategory.name}
              className="
                max-h-full max-w-full
                object-contain
                transition duration-300
                group-hover:scale-105
              "
            />
          </div>

          {/* soft overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition" />

          {/* bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* text */}
          <div className="absolute bottom-0 p-3">
            <h2 className="text-white text-lg md:text-xl font-semibold leading-tight drop-shadow-sm">
              {subcategory.name}
            </h2>
          </div>

        </div>
      </Link>
    ))}
</div>

        </div>
            <div className="bg-[#E5E9F2] min-h-screen  p-4 lg:p-0">
              <div className="max-w-screen-xl mx-auto mt-12">
                <h1 className="text-black font-bold text-4xl py-2 lg:pt-8 pt-0 text-center">
                  Recommend for you
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
      </section>
    </div>
  );
}
