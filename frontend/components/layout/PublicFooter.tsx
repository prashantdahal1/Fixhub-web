"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function PublicFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return <Footer />;
}
