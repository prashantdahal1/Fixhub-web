"use client";

import { useState, useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: string;
  category: "Electrician" | "Plumber" | "Painter" | "Carpenter" | "AC Repair";
  title: string;
  status: "Completed" | "Cancelled";
  date: string;
  technician: string;
  rating: number;
  location: string;
  amount: string;
  amountRaw: number;
  hasReport: boolean;
  hasPhotos: boolean;
}

// ─── Dataset ───────────────────────────────────────────────────────────────────
const HISTORY: HistoryEntry[] = [
  { id: "FH-2026-0812", category: "Electrician", title: "Breaker Investigation & Replacement", status: "Completed", date: "2026-06-28", technician: "Anil Thapa",      rating: 4.8, location: "Koteshwor, Kathmandu",  amount: "3,450",  amountRaw: 3450,  hasReport: true,  hasPhotos: true  },
  { id: "FH-2026-0798", category: "Plumber",     title: "Geyser Thermostat Replacement",       status: "Completed", date: "2026-06-15", technician: "Suman Maharjan",  rating: 4.9, location: "Bakhundole, Lalitpur", amount: "4,800",  amountRaw: 4800,  hasReport: true,  hasPhotos: false },
  { id: "FH-2026-0754", category: "AC Repair",   title: "AC Unit Seasonal Maintenance",        status: "Completed", date: "2026-05-22", technician: "Rohan Shrestha",  rating: 4.8, location: "Sanepa, Lalitpur",      amount: "2,500",  amountRaw: 2500,  hasReport: true,  hasPhotos: true  },
  { id: "FH-2026-0712", category: "Carpenter",   title: "Kitchen Drawer Rails Restoration",    status: "Completed", date: "2026-05-05", technician: "Rajesh Shrestha", rating: 4.6, location: "Jhamsikhel, Lalitpur",  amount: "1,950",  amountRaw: 1950,  hasReport: false, hasPhotos: false },
  { id: "FH-2026-0689", category: "Plumber",     title: "Kitchen Tap & Pipe Replacement",      status: "Cancelled", date: "2026-04-18", technician: "Suman Maharjan",  rating: 4.9, location: "Bakhundole, Lalitpur", amount: "0",      amountRaw: 0,     hasReport: false, hasPhotos: false },
  { id: "FH-2026-0640", category: "Painter",     title: "Living Room Accent Wall Paint",       status: "Completed", date: "2026-04-02", technician: "Bibek Lama",      rating: 4.7, location: "Koteshwor, Kathmandu",  amount: "9,800",  amountRaw: 9800,  hasReport: true,  hasPhotos: true  },
];

// ─── Expanded Detail Drawer ────────────────────────────────────────────────────
function DetailDrawer({ entry }: { entry: HistoryEntry }) {
  return (
    <tr className="bg-slate-50">
      <td colSpan={5} className="px-6 pb-5 pt-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs pt-3 border-t border-slate-200">

          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">Location</p>
            <p className="font-semibold text-slate-800">{entry.location}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">Reference ID</p>
            <p className="font-mono text-slate-700 tracking-tight">{entry.id}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">Documents</p>
            <div className="flex flex-col gap-1.5">
              {entry.hasReport ? (
                <button
                  onClick={() => alert(`Downloading PDF for ${entry.id}`)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-[#2563EB] font-medium transition-colors text-left"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  PDF Certificate
                </button>
              ) : (
                <span className="text-slate-300">No report</span>
              )}
              {entry.hasPhotos && (
                <button
                  onClick={() => alert(`Opening photos for ${entry.id}`)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-[#2563EB] font-medium transition-colors text-left"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  Before / After
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div />
            <button
              onClick={() => alert(`Filing report for ${entry.id}`)}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors text-left"
            >
              Report an Issue →
            </button>
          </div>

        </div>
      </td>
    </tr>
  );
}

// ─── Sort indicator ────────────────────────────────────────────────────────────
function SortArrow({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1 text-[10px] ${active ? "text-slate-700" : "text-slate-300"}`}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "Cancelled">("All");
  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (key: "date" | "amount") => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return HISTORY
      .filter(h => {
        const matchQ = !q || h.title.toLowerCase().includes(q) || h.id.toLowerCase().includes(q) || h.technician.toLowerCase().includes(q);
        const matchF = statusFilter === "All" || h.status === statusFilter;
        return matchQ && matchF;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "date") return dir * (a.date > b.date ? 1 : -1);
        return dir * (a.amountRaw - b.amountRaw);
      });
  }, [search, statusFilter, sortKey, sortDir]);

  const visibleTotal = filtered
    .filter(h => h.status === "Completed")
    .reduce((s, h) => s + h.amountRaw, 0);

  const grandTotal = HISTORY
    .filter(h => h.status === "Completed")
    .reduce((s, h) => s + h.amountRaw, 0);

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Service History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="font-mono">{HISTORY.length}</span> records &middot; ₨&thinsp;<span className="font-mono">{grandTotal.toLocaleString()}</span> total invoiced
          </p>
        </div>

        {/* Status filter — grayscale segmented control */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden divide-x divide-slate-200 self-start sm:self-auto">
          {(["All", "Completed", "Cancelled"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 text-[11px] font-bold tracking-wide transition-colors ${
                statusFilter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="relative max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search service, agent, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs leading-none transition-colors">
            ✕
          </button>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* ── Column Headers ── */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Service</span>
                </th>
                <th className="px-5 py-3 text-left hidden md:table-cell">
                  <button
                    onClick={() => handleSort("date")}
                    className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center hover:text-slate-700 transition-colors"
                  >
                    Date <SortArrow active={sortKey === "date"} dir={sortDir} />
                  </button>
                </th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Technician</span>
                </th>
                <th className="px-5 py-3 text-left">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Status</span>
                </th>
                <th className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("amount")}
                    className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center ml-auto hover:text-slate-700 transition-colors"
                  >
                    Cost <SortArrow active={sortKey === "amount"} dir={sortDir} />
                  </button>
                </th>
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <p className="text-sm font-semibold text-slate-400">No records match your query.</p>
                    <button
                      onClick={() => { setSearch(""); setStatusFilter("All"); }}
                      className="mt-2 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((entry, idx) => {
                  const isExpanded = expandedId === entry.id;
                  const isLast = idx === filtered.length - 1;

                  return (
                    <>
                      <tr
                        key={entry.id}
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? "bg-slate-50"
                            : "bg-white"
                        } ${!isLast || isExpanded ? "border-b border-slate-100" : ""}`}
                      >
                        {/* SERVICE */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900 leading-tight">{entry.title}</p>
                          <p className="font-mono text-[10px] text-slate-400 tracking-tight mt-0.5 tabular-nums">{entry.id}</p>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="font-mono text-xs text-slate-500 tabular-nums tracking-tight">{entry.date}</span>
                        </td>

                        {/* TECHNICIAN */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <p className="text-xs font-semibold text-slate-800">{entry.technician}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">★ {entry.rating}</p>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold tracking-wide uppercase ${
                            entry.status === "Completed"
                              ? "text-slate-700"
                              : "text-slate-400 line-through"
                          }`}>
                            {entry.status}
                          </span>
                        </td>

                        {/* COST */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-mono text-sm font-black tabular-nums tracking-tight ${
                              entry.amountRaw > 0 ? "text-slate-900" : "text-slate-300"
                            }`}>
                              {entry.amountRaw > 0 ? `₨\u202F${entry.amount}` : "—"}
                            </span>
                            {/* Expand chevron */}
                            <svg
                              width="12" height="12" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              className="text-slate-300 shrink-0"
                              style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Drawer */}
                      {isExpanded && <DetailDrawer key={`${entry.id}-drawer`} entry={entry} />}
                    </>
                  );
                })
              )}
            </tbody>

            {/* ── Footer totals ── */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={3} className="px-6 py-3 hidden md:table-cell">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
                      {filtered.length} row{filtered.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td colSpan={3} className="table-cell md:hidden px-6 py-3">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
                      {filtered.length} rows
                    </span>
                  </td>
                  <td className="hidden lg:table-cell" />
                  <td className="hidden md:table-cell" />
                  <td className="px-6 py-3 text-right">
                    <span className="font-mono text-sm font-black text-slate-900 tabular-nums">
                      ₨{"\u202F"}{visibleTotal.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}

          </table>
        </div>
      </div>

    </div>
  );
}
