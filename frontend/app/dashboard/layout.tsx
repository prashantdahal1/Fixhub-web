"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);
const BookingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
  </svg>
);
const SupportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Nav items ─────────────────────────────────────────────────────────────────
const navItems = [
  { label: "Home",            icon: HomeIcon,     href: "/dashboard"          },
  { label: "Active Bookings", icon: BookingsIcon, href: "/dashboard/bookings" },
  { label: "Service History", icon: HistoryIcon,  href: "/dashboard/history"  },
  { label: "Support",         icon: SupportIcon,  href: "/dashboard/support"  },
];

// ─── Layout ────────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, loading } = useAuth();

  const initials = `${user?.firstName?.charAt(0) || "U"}${user?.lastName?.charAt(0) || ""}`.toUpperCase();
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User";
  const avatarUrl = user?.profilePicture;

  const handleLogout = async () => {
    try { await fetch("/api/v1/auth/logout", { method: "POST" }); } catch (_) {}
    finally { setUser(null); router.push("/"); }
  };

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <svg className="animate-spin h-7 w-7 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans flex">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="w-[240px] bg-white border-r border-slate-200 flex-shrink-0 flex flex-col sticky top-0 h-screen">

        {/* Logo */}
        <div className="h-[60px] flex items-center px-5 border-b border-slate-100 shrink-0">
          <Image src="/images/fixhub.png" alt="FixHub" width={100} height={32} className="object-contain" priority />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium"
                }`}
              >
                <span className={isActive ? "text-[#2563EB]" : "text-slate-400 group-hover:text-slate-600 transition-colors"}>
                  <Icon />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User Card Pinned (Approach A & B merge) */}
        <div className="border-t border-slate-100 px-3 py-4 shrink-0 space-y-1 bg-white mb-2">
          {/* User profile navigation card */}
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group ${
              pathname === "/dashboard/profile" ? "bg-[#EFF6FF] text-[#2563EB]" : "hover:bg-slate-50"
            }`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${pathname === "/dashboard/profile" ? "text-[#2563EB]" : "text-slate-800"}`}>
                {fullName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || ""}</p>
            </div>
            <span className={`transition-colors shrink-0 ${pathname === "/dashboard/profile" ? "text-[#2563EB]" : "text-slate-300 group-hover:text-slate-500"}`}>
              <ChevronRight />
            </span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-[60px] bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          {/* Page title derived from pathname */}
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {pathname === "/dashboard/profile" ? "My Profile" : (navItems.find(n => n.href === pathname)?.label ?? "Dashboard")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Emergency */}
            <button className="hidden sm:flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Emergency
            </button>

            {/* Bell */}
            <div className="relative">
              <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <BellIcon />
              </button>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-white" />
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-slate-200" />

            {/* Top Right Avatar Link to Profile */}
            <Link href="/dashboard/profile" className="flex-shrink-0 transition-opacity hover:opacity-85">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-blue-100">
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
