import Link from "next/link";
import { getCategories } from "@/src/entities/category/api/get-categories";
import Image from "next/image";

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
    "from-[rgba(54,183,50,0.1)] to-[rgba(54,183,50,0.05)]",
    "from-[rgba(0,123,255,0.1)] to-[rgba(0,123,255,0.05)]",
    "from-[rgba(255,193,7,0.1)] to-[rgba(255,193,7,0.05)]",
    "from-[rgba(220,53,69,0.1)] to-[rgba(220,53,69,0.05)]",
    "from-[rgba(102,16,242,0.1)] to-[rgba(102,16,242,0.05)]",
  ];

  // Дублируем карточки для бесконечной прокрутки
  const cards = [...(categories.map((cat, index) => ({
    title: cat.name,
    image: cat.image || "/car.png",
    href: `/${cat.slug}`,
    bg: bgColors[index % bgColors.length],
    priority: cat.priority
  }))), ...(categories.map((cat, index) => ({
    title: cat.name,
    image: cat.image || "/car.png",
    href: `/${cat.slug}`,
    bg: bgColors[index % bgColors.length],
    priority: cat.priority
  })))];

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] h-min-content lg:py-38 py-48 flex items-center justify-center overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
        <div className="absolute w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-700 bottom-20 right-20"></div>
        <div className="absolute w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000 bottom-40 left-40"></div>
        <div className="absolute w-80 h-80 bg-red-400/20 rounded-full blur-3xl animate-pulse delay-500 top-40 right-40"></div>
        
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 ">
              Everything will be{" "}
              <span className="inline-flex gap-0">
                <span className="text-blue-500 hover:scale-110 transition-transform inline-block">Z</span>
                <span className="text-green-500 hover:scale-110 transition-transform inline-block">A</span>
                <span className="text-red-500 hover:scale-110 transition-transform inline-block">M</span>
                <span className="text-orange-500 hover:scale-110 transition-transform inline-block">D</span>
                <span className="text-gray-900">Amazing</span>
              </span>
            </h1> 

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Discover amazing products and services from trusted sellers. 
              Join our community and start buying or selling today.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <Link href="/login">
                <button className="cursor-pointer group relative lg:px-12 px-8 py-3 bg-[#2AAEF7] text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <span className="relative z-10">Place an ad</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
              </Link>

              <Link href="/about">
                <button className="cursor-pointer lg:px-12 px-8 py-3 bg-green-400 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  About us
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gray-400 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our most popular categories and find exactly what you're looking for
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-6 animate-infinite-scroll hover:pause-animation">
              {cards.sort((a, b) => Number(b.priority) - Number(a.priority)).map((card, index) => (
                <Link 
                  key={`${card.title}-${index}`} 
                  href={card.href}
                  className="flex-shrink-0 group"
                >
                  <div className={`w-[220px] h-[200px] rounded-2xl p-6 bg-gradient-to-br ${card.bg} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 backdrop-blur-sm`}>
                    <div className="h-24 flex items-center justify-center mb-4">
                      <img
                        src={card.image}
                        width={120}
                        height={120}
                        className="object-contain max-h-full group-hover:scale-110 transition-transform duration-300"
                        alt={card.title}
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 text-center text-lg">
                      {card.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast & Secure</h3>
              <p className="text-gray-600 leading-relaxed">
                Your transactions are protected with state-of-the-art security. Shop with confidence.
              </p>
              <Link href="/security" className="inline-flex items-center mt-4 text-blue-600 font-semibold group-hover:gap-2 transition-all">
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Best Prices</h3>
              <p className="text-gray-600 leading-relaxed">
                Find the best deals and competitive prices from verified sellers across all categories.
              </p>
              <Link href="/deals" className="inline-flex items-center mt-4 text-green-600 font-semibold group-hover:gap-2 transition-all">
                View deals
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Community Trusted</h3>
              <p className="text-gray-600 leading-relaxed">
                Join thousands of satisfied users who trust our platform for their buying and selling needs.
              </p>
              <Link href="/community" className="inline-flex items-center mt-4 text-orange-600 font-semibold group-hover:gap-2 transition-all">
                Join community
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#2AAEF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join our community today and start exploring amazing opportunities
          </p>
          <Link href="/register">
            <button className="px-10 py-5 bg-white text-black font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg">
              Create your account
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}