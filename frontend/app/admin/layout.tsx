"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  Settings2,
} from "lucide-react";
import { getTokenCookie, clearAuthCookies } from "@/lib/cookies";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Registered Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

function SidebarContent({ pathname }: { pathname: string }) {
  const handleLogout = async () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await clearAuthCookies();
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-full flex-col bg-white relative">
      {/* Brand accent strip — FixHub blue */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
        style={{ background: "#2563EB" }}
      />

      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 ml-[3px]">
        <Image
          src="/images/fixhub.png"
          alt="FixHub Logo"
          width={120}
          height={40}
          className="object-contain"
          priority
        />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 ml-[3px]">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 ml-[3px]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      if (pathname === "/admin/login") {
        setIsAuthenticated(true);
        return;
      }
      const token = await getTokenCookie();
      if (!token) {
        window.location.href = "/admin/login";
      } else {
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await clearAuthCookies();
    window.location.href = "/admin/login";
  };

  const breadcrumbs = getBreadcrumbs(pathname || "/admin");

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col border-r border-slate-100">
        <SidebarContent pathname={pathname || ""} />
      </aside>

      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 border-r border-slate-100 shadow-xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-4 text-slate-400 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent pathname={pathname || ""} />
        </aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
              {breadcrumbs.map((bc, i) => (
                <span key={bc.href} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      bc.isLast
                        ? "text-slate-900 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {bc.label}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-slate-100 transition"
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    boxShadow: "0 1px 6px rgba(37,99,235,0.40)",
                  }}
                >
                  PP
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  Prashant Patel
                </span>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 z-20">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">
                        Prashant Patel
                      </p>
                      <p className="text-xs text-slate-400">
                        admin@fixhub.com
                      </p>
                    </div>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      <User className="h-4 w-4" />
                      My Profile
                    </button>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      <Settings2 className="h-4 w-4" />
                      Account Settings
                    </button>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
