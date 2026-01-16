"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_URL } from "@/src/shared/api/base";
import BackButton from "../back-button";

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
        className="p-4 border-0.5  border text-gray-900 border-black rounded-3xl ml-2 lg:h-[44px] h-[40px] lg:w-[510px] w-3/4"
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
        className="hover:opacity-80 transition bg-black w-[82px] absolute lg:right-0 right-[92px] lg:h-[44px] h-[40px] rounded-3xl flex justify-center items-center"
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
      <div className="absolute lg:hidden right-10 top-1">
        <Link href={"/notifications"}>
          <svg className="mr-3 hover:scale-105 invert" width="34" height="34" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.9813 2.07371C15.2986 3.01205 14.8958 4.16724 14.8958 5.4165C14.8958 8.49286 17.3383 10.9987 20.3899 11.1008C20.3901 11.1049 20.3904 11.109 20.3907 11.113C20.4066 11.3268 20.423 11.5472 20.4453 11.7594C20.7011 14.1942 21.287 15.8645 21.8486 16.9629C22.2226 17.6944 22.5896 18.1793 22.8499 18.4724C22.9802 18.6192 23.0845 18.7185 23.1504 18.777C23.1833 18.8064 23.2067 18.8255 23.219 18.8352L23.2284 18.8426C23.5113 19.0484 23.6309 19.4127 23.5243 19.7466C23.4167 20.0833 23.1037 20.3119 22.7502 20.3119L3.25005 20.3123C2.89654 20.3123 2.58359 20.0838 2.47606 19.7469C2.36944 19.4131 2.48901 19.0488 2.77185 18.843L2.7813 18.8356C2.79358 18.8259 2.81697 18.8067 2.84991 18.7775C2.91577 18.719 3.02001 18.6196 3.15038 18.4728C3.41071 18.1797 3.77759 17.6948 4.15166 16.9632C4.89821 15.5033 5.68755 13.033 5.68755 9.09984C5.68755 7.06183 6.44606 5.09758 7.81111 3.64153C9.17783 2.1837 11.0432 1.354 13.0001 1.354C13.4142 1.354 13.8247 1.39121 14.2275 1.46384C14.4849 1.51023 15.3307 1.77371 15.9813 2.07371Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M10.0189 2.07322C10.7016 3.01156 11.1044 4.16675 11.1044 5.41602C11.1044 8.49237 8.66193 10.9982 5.61039 11.1003C5.61018 11.1044 5.60985 11.1085 5.60953 11.1125C5.5936 11.3264 5.57724 11.5467 5.55493 11.7589C5.29915 14.1937 4.71329 15.864 4.15169 16.9624C3.77761 17.6939 3.41069 18.1788 3.15036 18.4719C3.02004 18.6187 2.91571 18.7181 2.84984 18.7766C2.81691 18.8059 2.79351 18.825 2.78127 18.8347L2.77184 18.8421C2.48898 19.0479 2.36938 19.4123 2.47598 19.7461C2.58356 20.0828 2.89653 20.3114 3.25003 20.3114L22.7502 20.3118C23.1037 20.3118 23.4167 20.0833 23.5242 19.7465C23.6308 19.4126 23.5112 19.0484 23.2284 18.8425L23.2189 18.8352C23.2067 18.8254 23.1833 18.8062 23.1503 18.777C23.0845 18.7185 22.9802 18.6191 22.8499 18.4723C22.5895 18.1792 22.2226 17.6943 21.8486 16.9627C21.102 15.5028 20.3127 13.0325 20.3127 9.09935C20.3127 7.06134 19.5542 5.09709 18.1891 3.64104C16.8224 2.18321 14.9571 1.35352 13.0001 1.35352C12.5861 1.35352 12.1755 1.39072 11.7727 1.46335C11.5153 1.50974 10.6696 1.77322 10.0189 2.07322Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M10.7182 22.0474C11.1063 21.8221 11.6035 21.9543 11.8287 22.3425C11.9478 22.5476 12.1186 22.718 12.3241 22.8365C12.5297 22.9549 12.7628 23.0172 13 23.0172C13.2373 23.0172 13.4704 22.9549 13.6759 22.8365C13.8815 22.718 14.0524 22.5476 14.1714 22.3425C14.3965 21.9543 14.8938 21.8221 15.2818 22.0474C15.67 22.2725 15.8022 22.7697 15.577 23.1579C15.3151 23.6093 14.9393 23.984 14.487 24.2446C14.0347 24.505 13.522 24.6422 13 24.6422C12.4782 24.6422 11.9653 24.505 11.5131 24.2446C11.0608 23.984 10.6849 23.6093 10.4231 23.1579C10.1979 22.7697 10.33 22.2725 10.7182 22.0474Z" fill="white"/>
          </svg>
        </Link>
      </div>
      <BackButton absolute className="lg:hidden" />

      
    </div>
  );
}
