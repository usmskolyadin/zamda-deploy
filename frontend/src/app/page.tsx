
import Tabs from "./Tabs";
import Link from "next/link";
import { getCategories } from "@/src/entities/category/api/get-categories";
import Image from "next/image";
import AdsBlock from "../widgets/ad/AdBannerClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = await getCategories();
    console.log("Categories from API:", categories);
  } catch (e) {
    console.warn("Failed to fetch categories", e);
    categories = [];
  }

  const bgColors = [
    "bg-[rgba(54,183,50,0.1)]",   
    "bg-[rgba(0,123,255,0.1)]",   
    "bg-[rgba(255,193,7,0.1)]",   
    "bg-[rgba(220,53,69,0.1)]",   
    "bg-[rgba(102,16,242,0.1)]",  
  ];

  const cards = categories.map((cat, index) => ({
    title: cat.name, 
    image: cat.image || "/car.png",
    href: `/${cat.slug}`, 
    bg: bgColors[index % bgColors.length],
    priority: cat.priority
  }));

  return (
    <div className="w-full">
      <section className="bg-white pb-16 pt-14 p-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12">
        <h1 className="text-4xl font-bold text-black text-center">Buy & Sell Locally Across the U.S.</h1>
        <h1 className="text-md mt-4 font-bold text-black text-center">Cars, homes, jobs, services, and more.</h1>
        <div className="max-w-screen-xl mx-auto mt-8">
          <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-14 gap-8">
            {cards
            .sort((a, b) => Number(b.priority) - Number(a.priority))
            .map((card, index) => (
              <Link key={index} href={card.href}>
                <div className={`${card.bg} relative overflow-hidden lg:w-[195px] hover:opacity-80 transition w-full lg:h-[170px] h-[170px] rounded-2xl p-4`}>
                  <h2 className="relative z-10 font-bold text-black lg:text-lg text-left">{card.title}</h2>
                  <img
                    src={card.image}
                    width={200}
                    height={300}
                    className="absolute -bottom-4 -right-4 lg:h-[120px] h-[120px] w-auto object-contain pointer-events-none"
                    alt={card.title}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
        </div>
      </section>
      <section className="bg-[#E5E9F2] p-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto">
          <AdsBlock page={"home"} />
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="lg:text-4xl text-3xl mt-12 font-bold text-black text-center">Recommended for you</h1>
            <Tabs />
          </div>
          <div className="rounded-3xl w-full bg-[#F2F1F0] h-[136px] mt-12 mb-14 lg:flex hidden flex justify-center items-center">
            <Image src={"/zamdam.png"} width={1250} height={136} alt={""} />
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
