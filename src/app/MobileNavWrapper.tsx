"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/MobileNav";

export const MobileNavWrapper = () => {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return <MobileNav />;
};
