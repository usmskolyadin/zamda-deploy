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
                  <div className="relative h-[125px] md:h-[150px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">

                    <img
                      src={subcategory.image || "/billie.png"}
                      alt={subcategory.name}
                      className="absolute right-0 lg:w-5/6 lg:h-full w-7/8 h-7/8 object-cover group-hover:scale-105 transition duration-300"
                    />

                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition" />

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 p-3">
                      <h2 className="text-white text-xl md:text-xl font-semibold leading-tight">
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
