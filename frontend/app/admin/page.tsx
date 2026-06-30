"use client";

import {
  Wrench,
  ShieldCheck,
  CreditCard,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";

// ─── FixHub Brand Palette ─────────────────────────────────────────────────────
// Primary blue family (from logo): #1D4ED8  #2563EB  #3B82F6  #60A5FA
// Green  → positive trend direction ONLY
// Red    → negative trend / urgent ONLY
// No indigo, no purple anywhere.

const BLUE = {
  900: "#1E3A8A",
  800: "#1E40AF",
  700: "#1D4ED8",
  600: "#2563EB",
  500: "#3B82F6",
  400: "#60A5FA",
  100: "#DBEAFE",
  50:  "#EFF6FF",
} as const;

// Helper to generate a smooth Bezier path for the sparkline
function getBezierPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
    const cpY2 = p1.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return d;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, trend }: { data: number[]; trend: "up" | "down" }) {
  const w = 120, h = 40;
  const padX = 4, padY = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (w - 2 * padX);
    const y = (h - padY) - ((v - min) / range) * (h - 2 * padY);
    return { x, y };
  });

  const pathD = getBezierPath(points);
  const areaD = `${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  const stroke = trend === "up" ? "#16a34a" : "#dc2626";
  const gradientId = `sparkline-grad-${trend}-${Math.floor(Math.random() * 1000000)}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={stroke}
      />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const stats = [
  {
    id: "revenue",
    label: "Monthly Revenue",
    value: "₹41,210",
    delta: "+18%",
    trend: "up" as const,
    sub: "Estimated this month",
    sparkData: [28, 32, 29, 38, 36, 40, 44, 42, 48, 46, 50, 55],
    dominant: true,
  },
  {
    id: "bookings",
    label: "Total Bookings",
    value: "12,482",
    delta: "+12%",
    trend: "up" as const,
    sub: "Since last month",
    sparkData: [82, 90, 85, 92, 88, 95, 99, 97, 100, 103, 108, 112],
    dominant: false,
  },
  {
    id: "disputes",
    label: "Active Disputes",
    value: "862",
    delta: "−7%",
    trend: "down" as const,
    sub: "Ongoing cases",
    sparkData: [80, 74, 78, 71, 74, 69, 66, 63, 60, 58, 57, 56],
    dominant: false,
  },
  {
    id: "requests",
    label: "Open Requests",
    value: "145",
    delta: "−3%",
    trend: "down" as const,
    sub: "Pending allocation",
    sparkData: [22, 24, 25, 21, 19, 17, 17, 15, 14, 13, 13, 14],
    dominant: false,
  },
];

// Category bars — FixHub blue opacity steps
const categoryBreakdown = [
  { label: "Plumbing",   value: 42 },
  { label: "Electrical", value: 28 },
  { label: "HVAC",       value: 15 },
  { label: "Other",      value: 15 },
];
const BAR_COLORS = [BLUE[700], BLUE[600], BLUE[500], BLUE[400]];

// Activity rows
const activity = [
  {
    Icon: Wrench,
    iconColor: BLUE[600],
    text: "New request created for Plumbing",
    meta: "Request ID #4953-EOX · 12 min ago",
    tag: "New",
    tagClass: "text-slate-500 bg-slate-100 border border-slate-200/50",
  },
  {
    Icon: ShieldCheck,
    iconColor: BLUE[700],
    text: "Expert application approved for Aavas Rauniyar",
    meta: "Applicant ID #2210 · 48 min ago",
    tag: "Updated",
    tagClass: "text-blue-700 bg-blue-50 border border-blue-100",
  },
  {
    Icon: CreditCard,
    iconColor: "#16a34a",
    text: "Payout processed for Electrical Pros LLC",
    meta: "Payout ID #33,452 · 2 hrs ago",
    tag: "Completed",
    tagClass: "text-green-700 bg-green-50 border border-green-100",
  },
  {
    Icon: AlertOctagon,
    iconColor: "#dc2626",
    text: "System Alert: Latency spike in API Gateway",
    meta: "Region: AP-South-1 · 3 hrs ago",
    tag: "Urgent",
    tagClass: "text-red-700 bg-red-50 border border-red-100 font-semibold",
  },
];

const tagStyles: Record<string, { bg: string; dot: string }> = {
  new: {
    bg: "bg-slate-100 text-slate-700 border border-slate-200/80",
    dot: "bg-slate-500"
  },
  updated: {
    bg: "bg-blue-50 text-blue-800 border border-blue-200/60",
    dot: "bg-blue-600"
  },
  completed: {
    bg: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
    dot: "bg-emerald-600"
  },
  urgent: {
    bg: "bg-red-50 text-red-800 border border-red-200/60 font-semibold",
    dot: "bg-red-600"
  }
};

// ─── Unified Stat Card ──────────────────────────────────────────────────────
function StatCard({ s }: { s: (typeof stats)[number] }) {
  const isUp = s.trend === "up";
  const trendColor = isUp ? "#16a34a" : "#dc2626";
  const TrendIcon  = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className="relative bg-white border border-slate-200/60 p-6 rounded-2xl transition-all hover:translate-y-[-1px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] flex flex-col justify-between"
    >
      <div>
        {/* Label — lighter, less uppercase-shouty */}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] relative z-10">
          {s.label}
        </p>
        {/* Value — semibold, not black; warmer slate-700 instead of 900 */}
        <p
          className="mt-2 font-semibold text-slate-700 leading-none relative z-10 text-[1.75rem]"
          style={{ letterSpacing: "-0.01em" }}
        >
          {s.value}
        </p>

        {/* Delta + subtext */}
        <div className="mt-2.5 flex items-center gap-2 relative z-10">
          <span
            className="inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md"
            style={{
              background: isUp ? "rgba(22,163,74,0.07)" : "rgba(220,38,38,0.07)",
              color: trendColor,
            }}
          >
            <TrendIcon className="h-3 w-3" />
            {s.delta}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">{s.sub}</span>
        </div>
      </div>

      <div className="mt-5 h-12 w-full relative z-10">
        <Sparkline data={s.sparkData} trend={s.trend} />
      </div>
    </div>
  );
}

// ─── Category Bar ─────────────────────────────────────────────────────────────
function CategoryBar({
  label,
  value,
  color,
  rank,
  max,
}: {
  label: string;
  value: number;
  color: string;
  rank: number;
  max: number;
}) {
  const isTop = rank === 1;
  const height = 20;
  const widthPct = Math.round((value / max) * 100);

  return (
    <div className={isTop ? "bg-blue-50/30 p-4 rounded-2xl border border-blue-100/30" : "px-1"}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[13px] font-medium ${isTop ? "text-slate-700" : "text-slate-500"}`}>
            {label}
          </span>
          {isTop && (
            <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-semibold px-1.5 py-0.5 rounded-full tracking-wide uppercase">
              Top
            </span>
          )}
        </div>
        <span className="text-[13px] font-medium tabular-nums text-slate-500">
          {value}%
        </span>
      </div>

      {/* Track */}
      <div
        className="w-full bg-slate-100/80 relative overflow-hidden rounded-full"
        style={{ height }}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700 rounded-full"
          style={{
            width: `${widthPct}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}BB 100%)`,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const maxCategory = Math.max(...categoryBreakdown.map(c => c.value));

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1
            className="font-bold text-slate-700 leading-none"
            style={{ fontSize: "clamp(1.35rem, 3vw, 1.75rem)", letterSpacing: "-0.01em" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 font-normal">
            30-day snapshot &nbsp;·&nbsp; all services
          </p>
        </div>

        {/* Date Chip */}
        <div
          className="hidden sm:flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50/60 border border-blue-100/40 rounded-xl px-3.5 py-2 hover:bg-blue-100/30 transition-colors duration-200 cursor-pointer"
        >
          <Calendar className="h-3.5 w-3.5 text-blue-400" />
          <span>{dateLabel}</span>
        </div>
      </div>

      {/* ── Balanced Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {stats.map(s => <StatCard key={s.id} s={s} />)}
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

        {/* Activity feed */}
        <div
          className="xl:col-span-2 bg-white border border-slate-200/50 p-6 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-600 tracking-tight">
              Recent Activity
            </h2>
            <button
              className="text-xs font-medium transition-colors text-slate-400 hover:text-[#2563EB]"
            >
              View all &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-50 flex-1 flex flex-col justify-between">
            {activity.map((a, i) => {
              const { Icon } = a;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  {/* Icon container */}
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${a.iconColor}12`,
                      color: a.iconColor,
                    }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1 ml-1">
                    <p className="text-[13px] text-slate-700 truncate font-medium leading-snug">
                      {a.text}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                      {a.meta}
                    </p>
                  </div>

                  {(() => {
                    const style = tagStyles[a.tag.toLowerCase()] || tagStyles.new;
                    return (
                      <span
                        className={`ml-3 inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 shrink-0 border capitalize font-medium ${style.bg}`}
                      >
                        <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                        {a.tag}
                      </span>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div
          className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-600">
              Category Breakdown
            </h2>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50/80 border border-blue-100/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
              2,400 jobs
            </span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {categoryBreakdown.map((c, i) => (
              <CategoryBar
                key={c.label}
                label={c.label}
                value={c.value}
                color={BAR_COLORS[i]}
                rank={i + 1}
                max={maxCategory}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
