"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  Wrench,
  Briefcase,
  Users,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { authHeaders } from "@/lib/api/client";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<{ label: string; count: number; pct: number; color: string }[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [tick, setTick] = useState(0);

  // Pulse the live indicator
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const headers = authHeaders();

      const [usersRes, servicesRes, bookingsRes, ticketsRes] = await Promise.allSettled([
        fetch("/api/v1/admin/users?page=1&size=100", { headers, credentials: "include" }),
        fetch("/api/v1/services?limit=100", { headers, credentials: "include" }),
        fetch("/api/v1/bookings", { headers, credentials: "include" }),
        fetch("/api/v1/tickets/admin", { headers, credentials: "include" }),
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        const json = await usersRes.value.json();
        setTotalUsers(json.meta?.total || (json.data ? json.data.length : 0));
      }

      let servicesList: any[] = [];
      if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
        const json = await servicesRes.value.json();
        servicesList = json.data || [];
        setTotalServices(json.meta?.total || servicesList.length);

        const cats: Record<string, number> = {};
        servicesList.forEach((s) => {
          const cat = s.category || "other";
          cats[cat] = (cats[cat] || 0) + 1;
        });
        const total = servicesList.length || 1;
        const palette = ["#6366F1", "#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];
        setCategoryCounts(
          Object.entries(cats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([cat, count], i) => ({
              label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " "),
              count,
              pct: Math.round((count / total) * 100),
              color: palette[i % palette.length],
            }))
        );
      }

      let bookingsList: any[] = [];
      if (bookingsRes.status === "fulfilled" && bookingsRes.value.ok) {
        const json = await bookingsRes.value.json();
        bookingsList = json.data || [];
        setTotalBookings(bookingsList.length);
        setTotalRevenue(bookingsList.reduce((acc: number, b: any) => acc + (b.amount || 0), 0));
      }

      if (ticketsRes.status === "fulfilled" && ticketsRes.value.ok) {
        const json = await ticketsRes.value.json();
        const list = json.data || [];
        setOpenTickets(list.filter((t: any) => t.status !== "Resolved").length);
      }

      const activities: any[] = [];
      bookingsList.slice(0, 3).forEach((b: any) => {
        activities.push({
          icon: "booking",
          text: `Booking ${b.status || "confirmed"}`,
          meta: `Rs. ${b.amount || 0} · ${new Date(b.createdAt || Date.now()).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`,
          tag: b.status || "Confirmed",
          color: "#6366F1",
          tagBg: "bg-violet-50 text-violet-700 border-violet-100",
        });
      });
      servicesList.slice(0, 2).forEach((s: any) => {
        activities.push({
          icon: "service",
          text: `Service: "${s.title}"`,
          meta: `${s.category} · Rs. ${s.basePrice}/flat`,
          tag: "Live",
          color: "#10B981",
          tagBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
        });
      });
      setRecentActivities(
        activities.length > 0
          ? activities
          : [{ icon: "zap", text: "Connected to MongoDB", meta: "All systems live", tag: "Online", color: "#2563EB", tagBg: "bg-blue-50 text-blue-700 border-blue-100" }]
      );
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const timeLabel = today.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const iconMap: Record<string, ReactElement> = {
    booking: <Briefcase className="w-4 h-4" />,
    service: <Wrench className="w-4 h-4" />,
    user: <Users className="w-4 h-4" />,
    ticket: <AlertCircle className="w-4 h-4" />,
    zap: <Zap className="w-4 h-4" />,
  };

  const statCards = [
    {
      label: "Registered Users",
      value: loading ? "—" : totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      accent: "from-blue-600 to-blue-500",
      glow: "#2563EB",
      sub: "All accounts",
      link: "/admin/users",
    },
    {
      label: "Active Services",
      value: loading ? "—" : totalServices.toLocaleString(),
      icon: <Wrench className="w-5 h-5" />,
      accent: "from-emerald-600 to-emerald-500",
      glow: "#10B981",
      sub: "Catalog listings",
      link: "/admin/services",
    },
    {
      label: "Platform Revenue",
      value: loading ? "—" : `Rs. ${totalRevenue.toLocaleString("en-IN")}`,
      icon: <TrendingUp className="w-5 h-5" />,
      accent: "from-violet-600 to-violet-500",
      glow: "#8B5CF6",
      sub: `${totalBookings} bookings`,
      link: "/admin/analytics",
    },
    {
      label: "Open Tickets",
      value: loading ? "—" : openTickets.toLocaleString(),
      icon: <AlertCircle className="w-5 h-5" />,
      accent: "from-amber-500 to-orange-500",
      glow: "#F59E0B",
      sub: "Needs attention",
      link: "/admin/tickets",
    },
  ];

  const quickLinks = [
    { label: "Manage Users", href: "/admin/users", icon: <Users className="w-4 h-4" />, desc: "View & edit all accounts", color: "#2563EB", bg: "bg-blue-50" },
    { label: "Services Catalog", href: "/admin/services", icon: <Wrench className="w-4 h-4" />, desc: "Browse listed services", color: "#10B981", bg: "bg-emerald-50" },
    { label: "Support Tickets", href: "/admin/tickets", icon: <AlertCircle className="w-4 h-4" />, desc: "Resolve customer issues", color: "#F59E0B", bg: "bg-amber-50" },
    { label: "Analytics", href: "/admin/analytics", icon: <Activity className="w-4 h-4" />, desc: "Platform metrics & reports", color: "#8B5CF6", bg: "bg-violet-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* ─── HERO BANNER ─── */}
      <div className="relative overflow-hidden rounded-2xl mb-7 shadow-xl shadow-blue-900/15" style={{ background: "linear-gradient(145deg, #3B82F6 0%, #1D4ED8 45%, #1E3A8A 100%)" }}>
        {/* Premium ambient radial glows matching login & signup page */}
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full pointer-events-none opacity-30"
          style={{ background: "radial-gradient(circle, #60A5FA 0%, transparent 70%)" }} />
        <div className="absolute -bottom-16 left-1/3 w-60 h-60 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)" }} />

        <div className="relative z-10 p-6 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Live pill */}
              <div className="inline-flex items-center gap-2 mb-3.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-white/90 uppercase">Live Admin Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                FixHub Admin Workspace
              </h1>
              <p className="text-blue-100/90 text-sm mt-1.5 max-w-lg leading-relaxed font-normal">
                Real-time management dashboard and platform operations hub.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-blue-100/80 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-200" />
                <span>{dateLabel}</span>
                <span className="text-blue-300/60">•</span>
                <span>{timeLabel} NST</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Clean Status & Refresh */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium text-white/90">System Operational</span>
              </div>
              <button
                onClick={fetchRealData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-xs font-semibold text-white transition-all backdrop-blur-md shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {statCards.map((card, i) => (
          <Link key={i} href={card.link} className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5">
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.accent} opacity-70`} />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${card.glow}cc, ${card.glow}88)` }}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">{card.sub}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
              <span className="ml-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${tick % 2 === 0 ? "opacity-100" : "opacity-40"} transition-opacity`} />
                LIVE
              </span>
            </div>
            <Link href="/admin/analytics" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded-md animate-pulse w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded-md animate-pulse w-1/2" />
                    </div>
                    <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                ))
              : recentActivities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ background: `${a.color}20`, color: a.color }}>
                        {iconMap[a.icon] || <Zap className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{a.text}</p>
                        <p className="text-xs text-slate-400">{a.meta}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ml-3 ${a.tagBg}`}>{a.tag}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Service Categories</h2>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              {totalServices} total
            </span>
          </div>
          <div className="px-6 py-5 space-y-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2.5 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-1.5 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                ))
              : categoryCounts.length > 0
              ? categoryCounts.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-700 capitalize">{c.label}</span>
                      <span className="text-slate-400">{c.count} · {c.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))
              : <p className="text-xs text-slate-400 text-center py-4">No category data available</p>}
          </div>
        </div>
      </div>

      {/* ─── QUICK ACCESS ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <Zap className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y divide-slate-100">
          {quickLinks.map((q, i) => (
            <Link key={i} href={q.href}
              className="flex flex-col gap-2 px-6 py-5 hover:bg-slate-50 transition-colors group">
              <div className={`w-9 h-9 rounded-xl ${q.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
                style={{ color: q.color }}>
                {q.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{q.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{q.desc}</p>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
