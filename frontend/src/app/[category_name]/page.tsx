import Image from "next/image";
import Link from "next/link";
import { getSubCategories } from "@/src/entities/sub-category/api/get-subcategories";
import { SubCategory } from "@/src/entities/sub-category/model/types";
import { Category } from "@/src/entities/category/model/types";
import { getCategoryBySlug } from "@/src/entities/category/api/get-categories";

interface Props {
  params: { category_name: string };
}

export default async function SubCategoriesPage({ params }: Props) {
  const categorySlug = params.category_name;

  const category: Category = await getCategoryBySlug(categorySlug);

  const subcategories: SubCategory[] = await getSubCategories(categorySlug);

  return (
    <div className="w-full">
      <section className="bg-[#ffffff] min-h-screen pb-16 pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 pb-2">
            <Link href="/">Home</Link> / <Link href="/categories">{category.name}</Link>
          </p>
          <h1 className="text-black font-bold text-4xl py-4">
            {category.name}
          </h1>
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
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
      </section>

      {/* <section className="bg-[#ffffff] pb-16 pt-8 p-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-black font-bold text-3xl py-4">
            Have you watched
          </h1>
          <div className="grid md:grid-cols-3 grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-2xl w-full flex mb-2">
                <Image
                  src={ad.image || "/billie.png"}
                  alt={ad.title}
                  width={100}
                  height={100}
                  className="w-1/2 h-[120px] rounded-2xl object-cover"
                />
                <div className="pl-4 flex-col w-1/2">
                  <h3 className="font-semibold text-lg text-[#2AAEF7]">
                    {ad.title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-black font-semibold text-md">{ad.price}</span>
                    {ad.oldPrice && <span className="text-gray-400 line-through text-md">{ad.oldPrice}</span>}
                  </div>
                  <p className="mt-1 flex text-gray-500 text-md">
                    <svg className="mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g opacity="0.5">
                        <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="2"/>
                        <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                    </svg>
                    {ad.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}
