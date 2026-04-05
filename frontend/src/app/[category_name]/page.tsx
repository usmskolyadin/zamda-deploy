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
            {subcategories.map((subcategory) => (
              <Link key={subcategory.id} href={`/${category.slug}/${subcategory.slug}`}>
                <div className="bg-[#F2F1F0] hover:opacity-70 transition h-[169px] rounded-2xl flex items-center justify-between">
                  <h2 className="font-semibold  p-4 text-black text-xl lg:max-w-[50%]">
                    {subcategory.name}
                  </h2>
                  <img
                    src={subcategory.image || "/billie.png"}
                    width={200}
                    height={120}
                    alt={subcategory.name}
                    className=" object-contain justify-end"
                  />
                </div>

              </Link>
            ))}
</div>

        </div>
            <div className="bg-[#E5E9F2] min-h-screen  p-4 lg:p-0">
              <div className="max-w-screen-xl mx-auto mt-12">
                <h1 className="text-black font-bold text-4xl py-2 lg:pt-8 pt-0 text-center">
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
      </section>
    </div>
  );
}
