"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/ayllu/crear", label: "Crear", icon: Users },
  { href: "/score", label: "Score", icon: Trophy },
  { href: "/leaderboard", label: "Ranking", icon: Medal },
];

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all",
                isActive
                  ? "text-ayllu-sun"
                  : "text-white/40 active:text-white/60"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{link.label}</span>
              {isActive && (
                <div className="absolute -top-0.5 w-4 h-0.5 bg-ayllu-sun rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
