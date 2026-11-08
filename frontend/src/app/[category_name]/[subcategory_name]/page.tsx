import { getAdsBySubcategory } from "@/src/entities/advertisment/api/get-ads";
import { getSubCategories } from "@/src/entities/sub-category/api/get-subcategories";
import SortDropdownForCategory from "@/src/widgets/category-sort-dropdown";
import Filters from "@/src/widgets/filters";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdBannerWithFetch from "./AdBannerWithFetch";
import StickyAdBlock from "@/src/widgets/ad/StickyBanner";
import ProductCard from "@/src/app/ProductCard";


interface Props {
  params: { category_name: string; subcategory_name: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function AdsBySubcategory({ params, searchParams }: Props) {
  const subcategories = await getSubCategories(params.category_name);

  const subcategory = subcategories.find(
    (sub) => sub.slug === params.subcategory_name
  );
  
  if (!subcategory) {
    notFound();
  }
  function mapSortToOrdering(sort?: string) {
    switch (sort) {
      case "price_asc":
        return "price";
      case "price_desc":
        return "-price";
      case "date_desc":
        return "-created_at";
      default:
        return undefined;
    }
  }

  const sortParam = mapSortToOrdering(searchParams.sort);
  const ads = await getAdsBySubcategory(subcategory.slug, sortParam);

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff] pt-8 p-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-gray-500 pb-2"><Link className="hover:underline" href="/">Home</Link> / <Link className="hover:underline" href={`/${params.category_name}`}>{params.category_name}</Link> / <Link className="hover:underline" href={`/${params.category_name}/${params.subcategory_name}`}>{subcategory.name}</Link></p>
          <h1 className="text-black font-bold text-4xl py-4">{subcategory.name}</h1>
        </div>
      </section>
      <section className="bg-[#ffffff]  pb-16 p-4">
        <div className="max-w-screen-xl mx-auto lg:flex lg:items-start px-4 sm:px-6 lg:px-12">
          <div className="lg:w-1/3">
            <Filters
              initialSubcategory={params.subcategory_name}
              categorySlug={params.category_name}
              mobileTitle={`Popular "${subcategory.name}"`}
            />

            <div className="mt-6 mr-10">
              <StickyAdBlock
                page="filters"
                height={500}
              />
            </div>
          </div>
          <div className="lg:w-2/3">
            <div>
              <h1 className="hidden lg:block text-black font-bold text-3xl py-4">Popular "{subcategory.name}"</h1>
            </div>
              <AdBannerWithFetch slug="subcategory" />
            
              <SortDropdownForCategory />
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
