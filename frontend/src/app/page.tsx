import Tabs from "./Tabs";
import Link from "next/link";
import { getCategories } from "@/src/entities/category/api/get-categories";

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
  }));

  return (
    <div className="w-full">
      <section className="bg-[#F5F5F5] pb-16 pt-16 p-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-14 gap-8">
            {cards.map((card, index) => (
              <Link key={index} href={card.href}>
                <div className={`${card.bg} lg:w-[200px] hover:opacity-70 transition w-full lg:h-[175px] h-[170px] rounded-2xl p-4`}>
                  <img
                    src={card.image}
                    width={200}
                    height={300}
                    className="lg:h-[107px] h-[100px] object-contain"
                    alt={card.title}
                  />
                  <h2 className="font-bold text-black lg:text-lg pt-1 truncate">{card.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#E5E9F2] p-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="text-4xl mt-12 font-bold text-black text-center">Recommended for you</h1>
            <Tabs />
          </div>
          <div className="rounded-3xl w-full bg-[#F2F1F0] h-[136px] mt-12 flex justify-center items-center">
            <h2 className="text-[#333333] text-3xl font-bold opacity-40">Your Ad Here</h2>
          </div>
        </div>
      </section>
    </div>
  );
}
