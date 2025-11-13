"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";

interface Advertisement {
  id: number;
  title: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname(); 

  useEffect(() => {
    setQuery("");
    setSuggestions([]);
  }, [pathname]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/ads/?search=${query}`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (error) {
        console.error("Ошибка поиска:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative flex items-center mt-4 mb-2 lg:mt-0 lg:mb-0">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-4 border-0.5 border text-gray-900 border-black rounded-3xl ml-2 lg:h-[44px] h-[40px] lg:w-[510px] w-3/4"
        placeholder="Find an ad..."
        type="text"
      />
      {loading && <p className="absolute top-12 left-4 text-gray-900">Loading...</p>}
      {suggestions.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-3xl m-1 z-50">
          {suggestions.map((ad) => (
            <Link
              key={ad.id}
              href={`/search?query=${encodeURIComponent(query)}`}
              className="block px-4 py-2 rounded-2xl hover:bg-gray-100 text-black"
            >
              {ad.title}
            </Link>
          ))}
        </div>
      )}
      <Link
        href={`/search?query=${encodeURIComponent(query)}`}
        className="bg-black w-[82px] absolute lg:right-0 right-[68px] lg:h-[44px] h-[40px] rounded-3xl flex justify-center items-center"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 17L21 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
                      <button className="absolute right-0 lg:hidden">
      <Link href={"/favorites"}>
                  <svg width="35" height="35" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M29.25 33C30.4926 33 31.5 31.9926 31.5 30.75C31.5 29.5074 30.4926 28.5 29.25 28.5C28.0074 28.5 27 29.5074 27 30.75C27 31.9926 28.0074 33 29.25 33Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.25 33C15.4926 33 16.5 31.9926 16.5 30.75C16.5 29.5074 15.4926 28.5 14.25 28.5C13.0074 28.5 12 29.5074 12 30.75C12 31.9926 13.0074 33 14.25 33Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 6H33L30 22.5H10.5L7.5 6ZM7.5 6C7.25 4.99999 6 3 3 3L7.5 6Z" fill="black"/>
                    <path d="M7.5 6H33L30 22.5H10.5L7.5 6ZM7.5 6C7.25 4.99999 6 3 3 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M30 22.5H10.5H7.84615C5.16969 22.5 3.75 23.6718 3.75 25.5C3.75 27.3282 5.16969 28.5 7.84615 28.5H29.25" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
      </Link>
                </button>
      
    </div>
  );
}
