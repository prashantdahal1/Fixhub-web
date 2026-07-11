"use client";

import { useState, useMemo } from "react";
import { Search, FileText, Image as ImageIcon, ChevronRight, CheckCircle2, XCircle, ArrowUpDown, Download } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: string;
  category: "Electrician" | "Plumber" | "Painter" | "Carpenter" | "AC Repair";
  title: string;
  subtitle: string;
  status: "Completed" | "Cancelled";
  date: string;
  technician: string;
  techInitials: string;
  techColor: string;
  rating: number;
  location: string;
  amountRaw: number;
  hasReport: boolean;
  hasPhotos: boolean;
}

// ─── Dataset ───────────────────────────────────────────────────────────────────
const HISTORY: HistoryEntry[] = [
  { id: "FH-2026-0812", category: "Electrician", title: "Breaker Investigation & Replacement", subtitle: "Industrial Electrical",  status: "Completed", date: "2026-06-28", technician: "Anil Thapa",      techInitials: "AT", techColor: "bg-purple-600", rating: 4.8, location: "Koteshwor, Kathmandu",  amountRaw: 3450, hasReport: true,  hasPhotos: true  },
  { id: "FH-2026-0798", category: "Plumber",     title: "Geyser Thermostat Replacement",       subtitle: "Plumbing & Fixtures",    status: "Completed", date: "2026-06-15", technician: "Suman Maharjan",  techInitials: "SM", techColor: "bg-cyan-600",   rating: 4.9, location: "Bakhundole, Lalitpur", amountRaw: 4800, hasReport: true,  hasPhotos: false },
  { id: "FH-2026-0754", category: "AC Repair",   title: "AC Unit Seasonal Maintenance",        subtitle: "HVAC Services",          status: "Completed", date: "2026-05-22", technician: "Rohan Shrestha",  techInitials: "RS", techColor: "bg-blue-600",   rating: 4.8, location: "Sanepa, Lalitpur",      amountRaw: 2500, hasReport: true,  hasPhotos: true  },
  { id: "FH-2026-0712", category: "Carpenter",   title: "Kitchen Drawer Rails Restoration",    subtitle: "Carpentry & Woodwork",   status: "Completed", date: "2026-05-05", technician: "Rajesh Shrestha", techInitials: "RS", techColor: "bg-amber-600",  rating: 4.6, location: "Jhamsikhel, Lalitpur",  amountRaw: 1950, hasReport: false, hasPhotos: false },
  { id: "FH-2026-0689", category: "Plumber",     title: "Kitchen Tap & Pipe Replacement",      subtitle: "Plumbing & Fixtures",    status: "Cancelled", date: "2026-04-18", technician: "Suman Maharjan",  techInitials: "SM", techColor: "bg-cyan-600",   rating: 4.9, location: "Bakhundole, Lalitpur", amountRaw: 0,    hasReport: false, hasPhotos: false },
  { id: "FH-2026-0640", category: "Painter",     title: "Living Room Accent Wall Paint",       subtitle: "Painting & Finishing",   status: "Completed", date: "2026-04-02", technician: "Bibek Lama",      techInitials: "BL", techColor: "bg-emerald-600", rating: 4.7, location: "Koteshwor, Kathmandu",  amountRaw: 9800, hasReport: true,  hasPhotos: true  },
];

type TabFilter = "All" | "Completed" | "Cancelled";

export default function HistoryPage() {
  const [tab, setTab] = useState<TabFilter>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (key: "date" | "amount") => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return HISTORY
      .filter(h => {
        const matchQ = !q || h.title.toLowerCase().includes(q) || h.id.toLowerCase().includes(q) || h.technician.toLowerCase().includes(q);
        const matchTab = tab === "All" || h.status === tab;
        return matchQ && matchTab;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "date") return dir * (a.date > b.date ? 1 : -1);
        return dir * (a.amountRaw - b.amountRaw);
      });
  }, [search, tab, sortKey, sortDir]);

  const grandTotal = HISTORY.filter(h => h.status === "Completed").reduce((sum, h) => sum + h.amountRaw, 0);

  return (
    <div className="mx-auto max-w-5xl px-2 py-4 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service History</h1>
          <p className="mt-1 text-sm text-slate-500">
            {HISTORY.length} records · Rs {grandTotal.toLocaleString()} total invoiced
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 text-sm font-medium">
          {(["All", "Completed", "Cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTab(f)}
              className={[
                "rounded-md px-3 py-1.5 transition-colors",
                tab === f ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Export Row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service, agent, ID..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={() => alert("Exporting records...")}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Tabular Form with Support Page Aesthetic (Shadows, Borders, Tags) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-55 border-b border-gray-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Service Details</th>
                <th className="px-4 py-4 cursor-pointer hover:bg-slate-50" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-4">Technician</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right cursor-pointer hover:bg-slate-50" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-1 justify-end">
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((h) => {
                const isExpanded = expandedId === h.id;
                return (
                  <>
                    <tr
                      key={h.id}
                      onClick={() => setExpandedId(isExpanded ? null : h.id)}
                      className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-[14px]">{h.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{h.subtitle} · {h.id}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">{h.date}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ${h.techColor}`}>
                            {h.techInitials}
                          </div>
                          <span className="font-medium text-slate-700">{h.technician}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                            h.status === "Completed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-600",
                          ].join(" ")}
                        >
                          {h.status === "Completed" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {h.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">
                        {h.amountRaw > 0 ? `Rs ${h.amountRaw.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </td>
                    </tr>

                    {/* Detailed Expanded Drawer View */}
                    {isExpanded && (
                      <tr className="bg-slate-50/55">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
                            <div>
                              <span className="block font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Location Details</span>
                              <span className="text-slate-800 font-medium">{h.location}</span>
                            </div>
                            <div>
                              <span className="block font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Technician Rating</span>
                              <span className="text-slate-800 font-medium">★ {h.rating} / 5.0</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {h.hasReport && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); alert(`PDF Report for ${h.id}`); }}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                  PDF Report
                                </button>
                              )}
                              {h.hasPhotos && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); alert(`Photos for ${h.id}`); }}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm transition-colors"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                  Before/After
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="border-t border-gray-200 py-12 text-center text-sm text-slate-400 bg-white">
            No records match your search.
          </div>
        )}
      </div>
    </div>
  );
}
