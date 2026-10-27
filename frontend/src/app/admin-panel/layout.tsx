"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import LoadingScreen from "@/src/components/LoadingScreen";

const TABS = [
  { href: "/admin-panel", label: "Overview" },
  { href: "/admin-panel/listings", label: "Listings" },
  { href: "/admin-panel/reports", label: "Reports" },
  { href: "/admin-panel/users", label: "Users" },
  { href: "/admin-panel/audit-log", label: "Audit Log" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isStaff = !!user && (user.is_staff || user.is_superuser);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isStaff) router.replace("/");
  }, [isInitialized, isStaff, router]);

  if (!isInitialized) return <LoadingScreen message="Loading..." />;
  if (!isStaff) return <LoadingScreen message="Redirecting..." />;

  return (
    <div className="w-full">
      <section className="bg-white pb-16 p-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12">
          <h1 className="text-black font-bold text-3xl py-4">ZAMDA Admin</h1>

          <div className="flex gap-6 border-b mb-6 overflow-x-auto">
            {TABS.map((tab) => {
              const active =
                tab.href === "/admin-panel" ? pathname === "/admin-panel" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`whitespace-nowrap pb-2 font-bold text-lg transition ${
                    active ? "text-black border-b-4 border-black" : "text-gray-400 hover:text-black"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}
