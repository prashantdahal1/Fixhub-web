"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Wrench,
  ChevronRight,
  User,
  Settings2,
} from "lucide-react";

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
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">FixHub</p>
          <p className="text-[11px] text-slate-400">Enterprise Control</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition">
          <LogOut className="h-4 w-4 shrink-0" />
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
  const breadcrumbs = getBreadcrumbs(pathname || "/admin");

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
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
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
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
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
