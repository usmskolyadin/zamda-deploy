"use client";

import { getCategories } from "@/src/entities/category/api/get-categories";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
      }
    }
    load();
  }, []);

  const handleMouseEnter = () => {
    // Отменяем возможное закрытие
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // Даем пользователю время перевести курсор
    closeTimeout.current = setTimeout(() => setOpen(false), 250);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`rounded-3xl cursor-pointer p-4 lg:h-[44px] h-[40px] lg:w-[188px] w-[170px] flex justify-center items-center transition-colors duration-200
          ${open ? "bg-[#E5E9F2] text-black" : "bg-black text-white hover:bg-[#E5E9F2] hover:text-black"}`}
      >
        <span className={open ? "text-black" : "hover:text-black"}>All categories</span>
        <svg
          className={`ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="14"
          height="9"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 0.889061L5.88906 5.77812L10.7781 0.889061"
            stroke={open ? "black" : "white"}
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 py-3 w-[188px] bg-white rounded-3xl shadow-lg p-4 z-10 transition-opacity duration-200">
          <ul className="space-y-0.5">
            {categories.map((category, index) => (
              <li
                key={index}
                className="hover:bg-gray-100 p-2 rounded-xl text-black cursor-pointer"
              >
                <Link href={`/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
