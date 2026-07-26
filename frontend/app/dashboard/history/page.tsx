"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, Download, CheckCircle2, XCircle, Clock, ChevronDown,
  ChevronUp, MapPin, Calendar, DollarSign, User, Briefcase,
  ArrowUpDown, Package
} from "lucide-react";
import { apiFetch } from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import { useAuth } from "../../../contexts/AuthContext";

interface HistoryEntry {
  id: string;
  rawId: string;
  title: string;
  subtitle: string;
  status: string;
  date: string;
  dateRaw: string;
  otherParty: string;
  otherPartyInitials: string;
  avatarColor: string;
  location: string;
  amountRaw: number;
}

type TabFilter = "All" | "Completed" | "Cancelled" | "Confirmed" | "In_progress";

const AVATAR_COLORS = [
  "bg-violet-600", "bg-cyan-600", "bg-blue-600", "bg-amber-600", "bg-emerald-600", "bg-rose-600",
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  Completed:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Completed" },
  Cancelled:   { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500",    label: "Cancelled" },
  Confirmed:   { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",    label: "Confirmed" },
  In_progress: { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500",  label: "In Progress" },
  Pending:     { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",   label: "Pending" },
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isPro = user?.role === "professional";

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{ data: any[] }>(API.BOOKINGS.LIST);
        if (res.data) {
          const formatted = res.data.map((b) => {
            const srv = b.serviceId || {};
            const other = isPro ? b.customerId : b.professionalId;
            const fName = other?.firstName || (isPro ? "Customer" : "Unassigned");
            const lName = other?.lastName || "";
            const fullName = `${fName} ${lName}`.trim();
            const initials = `${fName[0] || ""}${lName[0] || ""}`.toUpperCase() || "U";
            const color = AVATAR_COLORS[b._id.charCodeAt(b._id.length - 1) % AVATAR_COLORS.length];
            const rawStatus = b.status || "pending";
            const status = rawStatus === "in_progress"
              ? "In_progress"
              : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
            const dateObj = new Date(b.scheduledAt);
            return {
              id: b._id.slice(-8).toUpperCase(),
              rawId: b._id,
              title: srv.title || "Service",
              subtitle: (srv.category || "General").replace(/_/g, " "),
              status,
              date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              dateRaw: dateObj.toISOString(),
              otherParty: fullName,
              otherPartyInitials: initials,
              avatarColor: color,
              location: b.address || "N/A",
              amountRaw: b.amount || 0,
            };
          });
          setHistoryData(formatted);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  const tabs: { id: TabFilter; label: string; count?: number }[] = [
    { id: "All",         label: "All",         count: historyData.length },
    { id: "Completed",   label: "Completed",   count: historyData.filter(h => h.status === "Completed").length },
    { id: "Confirmed",   label: "Confirmed",   count: historyData.filter(h => h.status === "Confirmed").length },
    { id: "In_progress", label: "In Progress", count: historyData.filter(h => h.status === "In_progress").length },
    { id: "Cancelled",   label: "Cancelled",   count: historyData.filter(h => h.status === "Cancelled").length },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return historyData
      .filter((h) => {
        const matchQ = !q || h.title.toLowerCase().includes(q) || h.id.toLowerCase().includes(q) || h.otherParty.toLowerCase().includes(q);
        const matchTab = tab === "All" || h.status === tab;
        return matchQ && matchTab;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "date") return dir * (a.dateRaw > b.dateRaw ? 1 : -1);
        return dir * (a.amountRaw - b.amountRaw);
      });
  }, [search, tab, sortKey, sortDir, historyData]);

  const totalEarned = historyData.filter(h => h.status === "Completed").reduce((s, h) => s + h.amountRaw, 0);

  return (
    <div className="max-w-5xl space-y-5">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{isPro ? "Job History" : "Service History"}</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {historyData.length} total records &nbsp;·&nbsp; NPR {totalEarned.toLocaleString()} {isPro ? "earned" : "spent"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, ID, person..."
              className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs">
            <Download className="h-3.5 w-3.5 text-blue-600" />
            Export
          </button>
        </div>
      </div>

      {/* ── Stat Pills ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isPro ? "Total Earned" : "Total Spent",  value: `NPR ${totalEarned.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Completed",   value: historyData.filter(h=>h.status==="Completed").length,   icon: CheckCircle2, color: "text-blue-600",    bg: "bg-blue-50"    },
          { label: "Active Jobs", value: historyData.filter(h=>h.status==="Confirmed"||h.status==="In_progress").length, icon: Clock, color: "text-indigo-600",  bg: "bg-indigo-50"  },
          { label: "Cancelled",   value: historyData.filter(h=>h.status==="Cancelled").length,   icon: XCircle,      color: "text-rose-600",    bg: "bg-rose-50"    },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-xs p-4">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                <p className="text-sm font-black text-slate-900">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl w-fit text-xs font-semibold text-slate-500">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              tab === t.id ? "bg-white text-blue-600 font-bold shadow-xs" : "hover:text-slate-900"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${tab === t.id ? "bg-blue-50 text-blue-600" : "bg-slate-200 text-slate-500"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}

        {/* Sort control */}
        <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2">
          <button
            onClick={() => { setSortKey("date"); setSortDir(d => d === "asc" ? "desc" : "asc"); }}
            className={`rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:text-slate-900 transition-colors ${sortKey === "date" ? "text-blue-600" : ""}`}
          >
            <Calendar className="h-3 w-3" /> Date
            <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={() => { setSortKey("amount"); setSortDir(d => d === "asc" ? "desc" : "asc"); }}
            className={`rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:text-slate-900 transition-colors ${sortKey === "amount" ? "text-blue-600" : ""}`}
          >
            <DollarSign className="h-3 w-3" /> Amount
            <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* ── Records List ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Package className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-600">No records found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((h) => {
            const st = STATUS_STYLES[h.status] || STATUS_STYLES.Pending;
            const expanded = expandedId === h.id;
            return (
              <div key={h.id} className="rounded-2xl bg-white border border-gray-100 shadow-xs overflow-hidden transition-all">
                {/* Main Row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : h.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl ${h.avatarColor} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                    {h.otherPartyInitials}
                  </div>

                  {/* Service info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{h.title}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 capitalize">{h.subtitle} &nbsp;·&nbsp; #{h.id}</p>
                  </div>

                  {/* Status pill */}
                  <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${st.bg} ${st.text} ${st.border} shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>

                  {/* Date */}
                  <span className="hidden md:block text-xs text-slate-500 font-medium shrink-0 w-28 text-right">{h.date}</span>

                  {/* Amount */}
                  <span className="text-sm font-extrabold text-slate-900 shrink-0 w-28 text-right">
                    {h.amountRaw > 0 ? `NPR ${h.amountRaw.toLocaleString()}` : "—"}
                  </span>

                  {/* Chevron */}
                  <div className="text-slate-400 shrink-0">
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* Expanded Detail Panel */}
                {expanded && (
                  <div className="border-t border-gray-100 bg-slate-50/60 px-5 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{isPro ? "Customer" : "Technician"}</p>
                          <p className="font-semibold text-slate-800">{h.otherParty}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Service Address</p>
                          <p className="font-semibold text-slate-800">{h.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Status</p>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${st.bg} ${st.text} ${st.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
