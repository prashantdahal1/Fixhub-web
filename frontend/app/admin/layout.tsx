"use client";

import { useState, useEffect, useRef } from "react";
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
  ArrowRight,
  User,
  Settings2,
  Wrench,
  Ticket,
  BarChart3,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { getTokenCookie, getUserData, clearAuthCookies } from "@/lib/cookies";
import { fetchNotifications, upsertNotification, type NotificationItem } from "@/lib/api/notifications";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Tickets", href: "/admin/tickets", icon: Ticket },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
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
  const [localAdmin, setLocalAdmin] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getUserData();
        if (mounted) setLocalAdmin(data || null);
      } catch (_) {
        if (mounted) setLocalAdmin(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex h-full flex-col bg-white relative">
      {/* Logo */}
      <div className="h-[64px] flex items-center px-5 border-b border-slate-100 shrink-0">
        <Image
          src="/images/fixhub.png"
          alt="FixHub Logo"
          width={100}
          height={32}
          className="object-contain"
          priority
          style={{ width: "auto", height: "auto" }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 px-3 block uppercase">
            Admin Workspace
          </span>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                    active
                      ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <span className={active ? "text-[#2563EB]" : "text-slate-400 group-hover:text-slate-600 transition-colors"}>
                    <Icon className="w-4 h-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom User Card */}
      <div className="border-t border-slate-100 px-3 py-3.5 shrink-0 bg-white mb-1">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group ${
            pathname === "/admin/settings" ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" : "hover:bg-slate-50"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {localAdmin?.name ? localAdmin.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "AD"}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate ${pathname === "/admin/settings" ? "text-[#2563EB]" : "text-slate-800"}`}>
              {localAdmin?.name || "Admin"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{localAdmin?.email || "admin@fixhub.com"}</p>
          </div>
          <span className={`transition-colors shrink-0 ${pathname === "/admin/settings" ? "text-[#2563EB]" : "text-slate-300 group-hover:text-slate-500"}`}>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminInfo, setAdminInfo] = useState<{ email: string; name: string } | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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
        const userData = await getUserData();
        if (userData) {
          setAdminInfo(userData);
        }
      }
    }
    checkAuth();
  }, [pathname]);

  // Notification polling & SSE
  useEffect(() => {
    if (!isAuthenticated) return;

    let eventSource: EventSource | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    const refreshNotifications = () => {
      fetchNotifications()
        .then(setNotifications)
        .catch((err) => console.error("Failed to load admin notifications", err));
    };

    refreshNotifications();

    if (typeof window !== "undefined" && "EventSource" in window) {
      eventSource = new EventSource("/api/v1/notifications/stream", { withCredentials: true });
      eventSource.addEventListener("notification", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as NotificationItem;
        setNotifications((items) => upsertNotification(items, payload));
      });
      eventSource.onerror = () => {
        eventSource?.close();
        if (!fallbackInterval) fallbackInterval = setInterval(refreshNotifications, 10000);
      };
    } else {
      fallbackInterval = setInterval(refreshNotifications, 10000);
    }

    return () => {
      eventSource?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isAuthenticated]);

  // Click outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await clearAuthCookies();
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    window.location.href = "/admin/login";
  };

  const breadcrumbs = getBreadcrumbs(pathname || "/admin");

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <svg className="animate-spin h-7 w-7 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-white border-r border-slate-100 flex-shrink-0 flex-col sticky top-0 h-screen">
        <SidebarContent pathname={pathname || ""} />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
        <aside
          className={`absolute inset-y-0 left-0 w-[260px] border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-4 text-slate-400 hover:text-slate-900 z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent pathname={pathname || ""} />
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-[60px] bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Admin Workspace indicator & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#2563EB]">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span>Admin Workspace</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
                {breadcrumbs.map((bc, i) => (
                  <span key={bc.href} className="flex items-center gap-1.5 min-w-0">
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                    <span className={`truncate ${bc.isLast ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                      {bc.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-px h-5 bg-slate-200" />

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Open notifications"
                data-testid="admin-notification-bell"
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  notifOpen ? "border-slate-300 bg-slate-100 text-slate-900" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span
                    data-testid="notification-unread-dot"
                    className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
                  />
                )}
              </button>

              {notifOpen && (
                <div
                  data-testid="notification-panel"
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h4>
                      <p className="text-[11px] text-slate-400">{notifications.filter((n) => !n.read).length} unread</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB]">Live</span>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-xs text-slate-500">
                        No notifications yet. New platform updates will appear here.
                      </div>
                    ) : (
                      notifications.slice(0, 3).map((notification) => (
                        <div key={notification._id} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.read ? "bg-slate-400" : "bg-blue-500"}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{notification.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notification.body}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href="/admin/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-between gap-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-3 py-2 transition"
                    >
                      <span>View all notifications</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-lg pl-1 pr-2 py-1 hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {adminInfo?.name ? adminInfo.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "AD"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {adminInfo?.name || "Admin User"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">Super Admin</span>
                </div>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{adminInfo?.name || "Admin User"}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{adminInfo?.email || "admin@fixhub.com"}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Admin Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Settings2 className="h-4 w-4 text-slate-400" />
                    System Settings
                  </Link>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

