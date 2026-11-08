
import Tabs from "./Tabs";
import Link from "next/link";
import { getCategories } from "@/src/entities/category/api/get-categories";
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
    "bg-[rgba(54,183,50,0.1)]",   // green
    "bg-[rgba(0,123,255,0.1)]",   // blue
    "bg-[rgba(255,193,7,0.1)]",   // yellow
    "bg-[rgba(220,53,69,0.1)]",   // red
    "bg-[rgba(102,16,242,0.1)]",  // purple
    "bg-[rgba(255,109,0,0.1)]",   // orange
    "bg-[rgba(0,188,212,0.1)]",   // cyan
    "bg-[rgba(233,30,99,0.1)]",   // pink
    "bg-[rgba(0,150,136,0.1)]",   // teal
    "bg-[rgba(121,85,72,0.1)]",   // brown
  ];

  // Mobile grid is 2 cols, desktop is 5 cols — avoid repeating a color
  // next to its left neighbor (-1) or the card above it in either
  // layout (-2 for mobile, -5 for desktop).
  const assignBgColors = (count: number) => {
    const assigned: string[] = [];
    for (let i = 0; i < count; i++) {
      const forbidden = new Set(
        [i - 1, i - 2, i - 5].filter((j) => j >= 0).map((j) => assigned[j])
      );
      const choices = bgColors.filter((c) => !forbidden.has(c));
      const pool = choices.length > 0 ? choices : bgColors;
      assigned.push(pool[i % pool.length]);
    }
    return assigned;
  };

  const sortedCategories = [...categories].sort(
    (a, b) => Number(b.priority) - Number(a.priority)
  );
  const cardColors = assignBgColors(sortedCategories.length);

  const cards = sortedCategories.map((cat, index) => ({
    title: cat.name,
    image: cat.image || "/car.png",
    href: `/${cat.slug}`,
    bg: cardColors[index],
    priority: cat.priority,
  }));

  return (
    <div className="w-full">
      <section className="bg-white pb-16 pt-6 p-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12">
        <h1 className="text-2xl lg:text-4xl font-bold text-black text-center">Buy & Sell Locally Across the U.S.</h1>
        <h1 className="text-md mt-4 font-bold text-black text-center">Cars, homes, jobs, services, and more.</h1>
        <div className="max-w-screen-xl mx-auto mt-8">
          <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-14 gap-8">
            {cards.map((card, index) => (
              <Link key={index} href={card.href}>
                <div className={`${card.bg} lg:w-[195px] hover:opacity-80  transition w-full lg:h-[170px] h-auto min-h-[170px] rounded-2xl p-4`}>
                  <img
                    src={card.image}
                    width={200}
                    height={300}
                    className="lg:h-[95px] h-[95px] object-contain"
                    alt={card.title}
                  />
                  <h2 className="font-bold text-black text-sm lg:text-lg pt-1 line-clamp-2 lg:truncate leading-tight break-words">{card.title}</h2>
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
          <AdsBlock page={"home"} desktopHeight={300} />
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="lg:text-4xl text-3xl mt-12 font-bold text-black text-center">Recommended for you</h1>
            <Tabs />
          </div>
          <div className="w-full mt-12 mb-14 lg:block hidden">
            <AdsBlock page={"home_footer"} height={136} desktopHeight={136} />
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
