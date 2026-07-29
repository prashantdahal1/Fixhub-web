"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Wrench, AlertCircle, DollarSign, RefreshCw, Activity, Star } from "lucide-react";
import { authHeaders } from "@/lib/api/client";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPros, setTotalPros] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [catBreakdown, setCatBreakdown] = useState<{ label: string; count: number; pct: number; color: string }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = authHeaders();

      const [usersRes, servicesRes, bookingsRes, ticketsRes] = await Promise.allSettled([
        fetch("/api/v1/admin/users?page=1&size=200", { headers, credentials: "include" }),
        fetch("/api/v1/services?limit=200", { headers, credentials: "include" }),
        fetch("/api/v1/bookings", { headers, credentials: "include" }),
        fetch("/api/v1/tickets/admin", { headers, credentials: "include" }),
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        const json = await usersRes.value.json();
        const users: any[] = json.data || [];
        setTotalUsers(json.meta?.total || users.length);
        setTotalPros(users.filter((u) => u.role === "professional").length);
      }

      let servicesList: any[] = [];
      if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
        const json = await servicesRes.value.json();
        servicesList = json.data || [];
        setTotalServices(json.meta?.total || servicesList.length);

        // top by rating
        const sorted = [...servicesList].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        setTopServices(sorted.slice(0, 5).map((s) => ({
          name: s.title,
          category: s.category,
          rating: s.averageRating || 0,
          price: s.basePrice || 0,
        })));

        const cats: Record<string, number> = {};
        servicesList.forEach((s) => { const c = s.category || "other"; cats[c] = (cats[c] || 0) + 1; });
        const total = servicesList.length || 1;
        const palette = ["#6366F1", "#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];
        setCatBreakdown(
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

      if (bookingsRes.status === "fulfilled" && bookingsRes.value.ok) {
        const json = await bookingsRes.value.json();
        const list: any[] = json.data || [];
        setTotalBookings(list.length);
        setTotalRevenue(list.reduce((a: number, b: any) => a + (b.amount || 0), 0));
        setRecentBookings(list.slice(0, 5));
      }

      if (ticketsRes.status === "fulfilled" && ticketsRes.value.ok) {
        const json = await ticketsRes.value.json();
        const list = json.data || [];
        setOpenTickets(list.filter((t: any) => t.status !== "Resolved").length);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = [
    { label: "Total Users", value: loading ? "-" : totalUsers.toLocaleString(), icon: Users, accent: "#2563EB", bg: "bg-blue-50", sub: `${totalPros} professionals` },
    { label: "Active Services", value: loading ? "-" : totalServices.toLocaleString(), icon: Wrench, accent: "#10B981", bg: "bg-emerald-50", sub: "Catalog listings" },
    { label: "Total Bookings", value: loading ? "-" : totalBookings.toLocaleString(), icon: BarChart3, accent: "#6366F1", bg: "bg-violet-50", sub: "All-time" },
    { label: "Gross Revenue", value: loading ? "-" : `Rs. ${totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, accent: "#F59E0B", bg: "bg-amber-50", sub: "From all bookings" },
    { label: "Open Tickets", value: loading ? "-" : openTickets.toLocaleString(), icon: AlertCircle, accent: "#EF4444", bg: "bg-red-50", sub: "Unresolved" },
    { label: "Avg Revenue/Booking", value: loading ? "-" : `Rs. ${totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString("en-IN") : 0}`, icon: TrendingUp, accent: "#0EA5E9", bg: "bg-sky-50", sub: "Per transaction" },
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Live metrics pulled directly from MongoDB</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm disabled:opacity-60 transition-all">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`} style={{ color: stat.accent }}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                {loading
                  ? <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                  : <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>}
              </div>
              <p className="text-xs text-slate-400 mt-2">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Activity className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-slate-400 text-sm">No bookings yet</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentBookings.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-slate-600 font-bold">{(b._id || b.bookingId || "").slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${b.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : b.status === "cancelled" ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                          {b.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-900 font-bold">Rs. {(b.amount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-3 text-xs text-slate-400">{new Date(b.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Wrench className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Service Mix</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2.5 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-1.5 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                ))
              : catBreakdown.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-700">{c.label}</span>
                      <span className="text-slate-400">{c.count} Â· {c.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
          </div>

          {/* Top services */}
          {!loading && topServices.length > 0 && (
            <div className="px-6 pb-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Top Rated Services</p>
              <div className="space-y-2">
                {topServices.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{s.name}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3 h-3" />{s.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

