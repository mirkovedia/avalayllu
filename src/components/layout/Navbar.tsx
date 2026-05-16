"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, LayoutDashboard, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ayllu/crear", label: "Crear Ayllu", icon: Users },
  { href: "/score", label: "Mi Score", icon: Trophy },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Mountain className="h-7 w-7 text-ayllu-sun group-hover:scale-110 transition-transform" />
              <span className="font-display font-bold text-xl text-white">
                Aval<span className="text-ayllu-sun">Ayllu</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-ayllu-sun/20 text-ayllu-sun"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </div>
    </nav>
  );
};
