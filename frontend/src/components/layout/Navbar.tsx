"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/screener", label: "Screener", icon: BarChart2 },
  { href: "/watchlist", label: "Watchlist", icon: Star },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      {/* Blue accent top bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-800 via-blue-500 to-blue-300" />
      <div className="mx-auto flex h-13 max-w-[1400px] items-center gap-8 px-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-blue-800 font-bold text-base tracking-tight shrink-0"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded bg-blue-800 text-white">
            <BarChart2 className="h-4 w-4" />
          </div>
          <span>IDX Screener</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-stretch h-13 gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 text-sm font-medium transition-colors",
                  active
                    ? "text-blue-800"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-t" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
