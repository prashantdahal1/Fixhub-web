"use client";

import { useMemo, useState } from "react";
import { Search, FileText, Image as ImageIcon, Star, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

type Status = "COMPLETED" | "CANCELLED";

type HistoryEntry = {
  id: string;
  service: string;
  date: string;
  technician: string;
  rating: number;
  status: Status;
  cost: number | null;
  hasReport: boolean;
  hasPhotos: boolean;
};

const HISTORY: HistoryEntry[] = [
  {
    id: "FH-2026-0812",
    service: "Breaker Investigation & Replacement",
    date: "2026-06-28",
    technician: "Anil Thapa",
    rating: 4.8,
    status: "COMPLETED",
    cost: 3450,
    hasReport: true,
    hasPhotos: true,
  },
  {
    id: "FH-2026-0798",
    service: "Geyser Thermostat Replacement",
    date: "2026-06-15",
    technician: "Suman Maharjan",
    rating: 4.9,
    status: "COMPLETED",
    cost: 4800,
    hasReport: true,
    hasPhotos: false,
  },
  {
    id: "FH-2026-0754",
    service: "AC Unit Seasonal Maintenance",
    date: "2026-05-22",
    technician: "Rohan Shrestha",
    rating: 4.8,
    status: "COMPLETED",
    cost: 2500,
    hasReport: true,
    hasPhotos: true,
  },
  {
    id: "FH-2026-0712",
    service: "Kitchen Drawer Rails Restoration",
    date: "2026-05-05",
    technician: "Rajesh Shrestha",
    rating: 4.6,
    status: "COMPLETED",
    cost: 1950,
    hasReport: false,
    hasPhotos: true,
  },
  {
    id: "FH-2026-0689",
    service: "Kitchen Tap & Pipe Replacement",
    date: "2026-04-18",
    technician: "Suman Maharjan",
    rating: 4.9,
    status: "CANCELLED",
    cost: null,
    hasReport: false,
    hasPhotos: false,
  },
  {
    id: "FH-2026-0640",
    service: "Living Room Accent Wall Paint",
    date: "2026-04-02",
    technician: "Bibek Lama",
    rating: 4.7,
    status: "COMPLETED",
    cost: 9800,
    hasReport: true,
    hasPhotos: true,
  },
];

export default function ServiceHistoryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Completed" | "Cancelled">("All");

  const filtered = useMemo(() => {
    return HISTORY.filter((h) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Completed" && h.status === "COMPLETED") ||
        (filter === "Cancelled" && h.status === "CANCELLED");
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        h.service.toLowerCase().includes(q) ||
        h.technician.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  const totalInvoiced = HISTORY.filter((h) => h.cost).reduce((sum, h) => sum + (h.cost ?? 0), 0);

  return (
    <div>
      <div className="mx-auto max-w-4xl px-8 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Service History</h1>
            <p className="mt-1 text-sm text-slate-500">
              {HISTORY.length} records · Rs {totalInvoiced.toLocaleString()} total invoiced
            </p>
          </div>
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 text-sm font-medium">
            {(["All", "Completed", "Cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "rounded-md px-3 py-1.5 transition-colors",
                  filter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Search — same component style as dashboard */}
        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search service, agent, ID..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Vertical timeline */}
        <div className="mt-8">
          <ol className="relative border-l-2 border-gray-200 pl-8">
            {filtered.map((h) => (
              <li key={h.id} className="mb-8 last:mb-0">
                {/* Timeline node */}
                <span
                  className={[
                    "absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-gray-100",
                    h.status === "COMPLETED" ? "bg-blue-600" : "bg-slate-300",
                  ].join(" ")}
                />

                <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {h.date}
                      </p>
                      <h3 className="mt-1 text-[15px] font-semibold text-slate-900">
                        {h.service}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">{h.id}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={[
                          "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          h.status === "COMPLETED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-600",
                        ].join(" ")}
                      >
                        {h.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {h.status}
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {h.cost ? `Rs ${h.cost.toLocaleString()}` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                        {h.technician.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {h.technician}
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {h.rating}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {h.hasReport && (
                        <button className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600">
                          <FileText className="h-3.5 w-3.5" />
                          PDF Report
                        </button>
                      )}
                      {h.hasPhotos && (
                        <button className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Before/After
                        </button>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-slate-400">
                No records match your search.
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
