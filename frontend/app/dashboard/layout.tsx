"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { IntelligentSearchBar } from "../../components/IntelligentSearchBar";
import { fetchNotifications, upsertNotification, type NotificationItem } from "../../lib/api/notifications";

// ─── Icons ───────────────────────────────────────────────────────────────────
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
const ServicesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="6" height="6" rx="1" />
    <rect x="16" y="3" width="6" height="6" rx="1" />
    <rect x="2" y="15" width="6" height="6" rx="1" />
    <rect x="16" y="15" width="6" height="6" rx="1" />
  </svg>
);
const SupportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const ZapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

type DBNotification = NotificationItem;

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString();
}

const notifColor: Record<string, string> = {
  booking: "bg-blue-500",
  confirm: "bg-emerald-500",
  done: "bg-slate-400",
  payment: "bg-violet-500",
};

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { label: "Home",            icon: HomeIcon,     href: "/dashboard"          },
  { label: "Services",        icon: ServicesIcon, href: "/dashboard/services" },
  { label: "Active Bookings", icon: BookingsIcon, href: "/dashboard/bookings" },
  { label: "Service History", icon: HistoryIcon,  href: "/dashboard/history"  },
  { label: "Support",         icon: SupportIcon,  href: "/dashboard/support"  },
];

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, loading } = useAuth();

  const [notifOpen, setNotifOpen]       = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    const refresh = () => {
      fetchNotifications()
        .then(setNotifications)
        .catch((err) => console.error("Error fetching notifications:", err));
    };

    refresh();

    if ("EventSource" in window) {
      eventSource = new EventSource("/api/v1/notifications/stream", { withCredentials: true });
      eventSource.addEventListener("notification", (event) => {
        const notification = JSON.parse((event as MessageEvent).data) as DBNotification;
        setNotifications((items) => upsertNotification(items, notification));
      });
      eventSource.onerror = () => {
        eventSource?.close();
        if (!fallbackInterval) fallbackInterval = setInterval(refresh, 10000);
      };
    } else {
      fallbackInterval = setInterval(refresh, 10000);
    }

    return () => {
      eventSource?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const initials  = `${user?.firstName?.charAt(0) || "U"}${user?.lastName?.charAt(0) || ""}`.toUpperCase();
  const fullName  = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User";
  const avatarUrl = user?.profilePicture;

  const handleLogout = async () => {
    try { await fetch("/api/v1/auth/logout", { method: "POST" }); } catch (_) {}
    finally { setUser(null); router.push("/"); }
  };

  const markAllRead = async () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    try {
      await fetch("/api/v1/notifications/read-all", { method: "PATCH" });
    } catch (_) {}
  };

  const dismissNotif = async (id: string) => {
    setNotifications(n => n.filter(x => x._id !== id));
    try {
      await fetch(`/api/v1/notifications/${id}`, { method: "DELETE" });
    } catch (_) {}
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Close profile panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { 
        setNotifOpen(false); 
        setProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

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
    <div className="min-h-screen bg-[#F9FAFB] font-sans flex overflow-hidden">

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="w-[260px] bg-white border-r border-slate-100 flex-shrink-0 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="h-[64px] flex items-center px-5 border-b border-slate-100 shrink-0">
          <Image src="/images/fixhub.png" alt="FixHub" width={100} height={32} className="object-contain" priority style={{ width: "auto", height: "auto" }} />
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {/* Section: NAVIGATION */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 px-3 block uppercase">
              Navigation
            </span>
            <div className="space-y-0.5">
              {(user?.role === "professional" ? [
                { label: "Dashboard", icon: HomeIcon, href: "/dashboard" },
                { label: "Marketplace", icon: ServicesIcon, href: "/dashboard/services" },
                { label: "Job Requests", icon: BookingsIcon, href: "/dashboard/bookings" },
                { label: "Job History", icon: HistoryIcon, href: "/dashboard/history" },
                { label: "Chat & Messages", icon: ChatIcon, href: "/dashboard/chat" },
                { label: "Wallet & Earnings", icon: WalletIcon, href: "/dashboard/wallet" },
              ] : [
                { label: "Dashboard", icon: HomeIcon, href: "/dashboard" },
                { label: "Services", icon: ServicesIcon, href: "/dashboard/services" },
                { label: "Active Bookings", icon: BookingsIcon, href: "/dashboard/bookings" },
                { label: "Service History", icon: HistoryIcon, href: "/dashboard/history" },
                { label: "Chat & Messages", icon: ChatIcon, href: "/dashboard/chat" },
              ]).map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                      isActive
                        ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                        : "text-slate-500 hover:text-slate-850 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span className={isActive ? "text-[#2563EB]" : "text-slate-400 group-hover:text-slate-600 transition-colors"}>
                      <Icon />
                    </span>
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section: SUPPORT & HELP */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 px-3 block uppercase">
              Support &amp; Tickets
            </span>
            <div className="space-y-0.5">
              {[
                { label: "Support & Tickets", icon: SupportIcon, href: "/dashboard/support" },
                { label: "My Profile", icon: UserIcon, href: "/dashboard/profile" },
              ].map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                      isActive
                        ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                        : "text-slate-500 hover:text-slate-855 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span className={isActive ? "text-[#2563EB]" : "text-slate-400 group-hover:text-slate-600 transition-colors"}>
                      <Icon />
                    </span>
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom: User card */}
        <div className="border-t border-slate-100 px-3 py-3.5 shrink-0 bg-white mb-1">
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group ${
              pathname === "/dashboard/profile" ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" : "hover:bg-slate-50"
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
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Top bar */}
        <header className="h-[60px] bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">

          {/* Search bar — customer only or pro status header */}
          <div className="flex-1 max-w-sm mx-6">
            {user?.role !== "professional" ? (
              <IntelligentSearchBar />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pro Workspace</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-px h-5 bg-slate-200" />

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  notifOpen
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400"
                }`}
              >
                <BellIcon />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}

              {notifOpen && (
                <div
                  className="absolute right-0 top-12 w-[380px] bg-white rounded-2xl z-[200] overflow-hidden border border-slate-100 shadow-2xl"
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4.5 pt-4 pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-850">Notifications</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200/80 transition-colors"
                      aria-label="Close notifications"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* List */}
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center px-5">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-600">
                          <BellIcon />
                        </div>
                        <p className="text-xs font-bold text-slate-800">All caught up</p>
                        <p className="text-[11px] text-slate-500 mt-1">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const iconBg: Record<string,string> = {
                          booking: "bg-blue-50",
                          confirm: "bg-emerald-50",
                          done:    "bg-indigo-50",
                          payment: "bg-red-50",
                        };
                        const iconFg: Record<string,string> = {
                          booking: "text-blue-500",
                          confirm: "text-emerald-500",
                          done:    "text-indigo-500",
                          payment: "text-red-500",
                        };
                        const icons: Record<string, React.ReactNode> = {
                          booking: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
                          confirm: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
                          done:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
                          payment: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
                        };
                        return (
                          <div
                            key={n._id}
                            className={`relative flex gap-3 px-4.5 py-3.5 transition-colors hover:bg-slate-50/50 ${
                              !n.read ? "bg-blue-50/10" : ""
                            }`}
                          >
                            {/* Unread circle dot */}
                            {!n.read && (
                              <span className="absolute left-2.5 top-[22px] w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            )}

                            {/* Icon box */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg[n.type]} ${iconFg[n.type]}`}>
                              {icons[n.type]}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className={`text-xs font-bold leading-none ${n.read ? "text-slate-700" : "text-slate-800"}`}>
                                  {n.title}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold shrink-0">{formatRelativeTime(n.createdAt)}</p>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-normal truncate">{n.body}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 text-center py-3 bg-white">
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-bold text-[#4F46E5] hover:text-[#3730A3] transition-colors"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}

            </div>

            <div className="w-px h-5 bg-slate-200" />

            {/* Avatar */}
            <div className="relative flex-shrink-0" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center focus:outline-none transition-opacity hover:opacity-85"
                aria-label="User menu"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-blue-100">
                    {initials}
                  </div>
                )}
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 mt-2.5 w-[160px] bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03)" }}
                >
                  <div className="px-1.5 space-y-0.5">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon />
                      <span>View profile</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100/70 my-1.5" />

                  <div className="px-1.5">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/70 transition-colors w-full text-left"
                    >
                      <LogoutIcon />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
