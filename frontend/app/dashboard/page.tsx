"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { IntelligentSearchBar } from "../components/IntelligentSearchBar";

// ─── Service Category Icons ────────────────────────────────────────────────────
// Each icon is purpose-drawn to clearly represent the trade — not generic defaults.

const ElectricianIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {/* Lightning bolt — universally understood for electrical */}
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(37,99,235,0.08)" />
  </svg>
);

const PlumberIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {/* Wrench — clear plumbing/repair symbol */}
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const PainterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {/* Paint roller — unmistakably painter */}
    <rect x="3" y="3" width="14" height="8" rx="2" fill="rgba(37,99,235,0.08)" />
    <path d="M5 11v4" />
    <rect x="3" y="15" width="4" height="5" rx="1" fill="rgba(37,99,235,0.08)" />
    <line x1="17" y1="7" x2="21" y2="7" />
  </svg>
);

const CarpenterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {/* Hammer — clear woodwork/carpentry symbol */}
    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
    <path d="M17.64 15L22 10.64" />
    <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.75l-2.25-2.25H14l-.34.34-.75-.75-.34.34L9 6.5l.75.75L9 8l1.5 1.5 1.5-1.5 3 3z" />
  </svg>
);

const ACIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {/* Air conditioner unit */}
    <rect x="2" y="5" width="20" height="9" rx="2" fill="rgba(37,99,235,0.08)" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 19c0-2 2-4 6-4s6 2 6 4" />
    <circle cx="8" cy="8" r="1" fill="#2563EB" />
    <circle cx="12" cy="8" r="1" fill="#2563EB" />
    <circle cx="16" cy="8" r="1" fill="#2563EB" />
  </svg>
);

// ─── Activity Icon Container ───────────────────────────────────────────────────
// One consistent treatment: blue-tinted rounded square. Only the inner SVG differs.
function ActivityIconContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
      {children}
    </div>
  );
}

const ACActivitySVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="9" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 19c0-2 2-4 6-4s6 2 6 4" />
  </svg>
);

const LightSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// ─── Data ──────────────────────────────────────────────────────────────────────
const services = [
  { label: "Electrician", icon: ElectricianIcon },
  { label: "Plumber",     icon: PlumberIcon },
  { label: "Painter",     icon: PainterIcon },
  { label: "Carpenter",   icon: CarpenterIcon },
  { label: "AC Repair",   icon: ACIcon },
];

const promos = [
  { title: "Get 30% Off",      sub: "on your first Geyser Service!", badge: "Limited Time" },
  { title: "Free Inspection",  sub: "on all electrical checkups this month!", badge: "This Month" },
  { title: "AC Deep Clean",    sub: "Flat ₹500 off — limited slots!", badge: "Few Slots Left" },
];

const recentActivity = [
  { icon: "ac",    label: "AC Maintenance",     date: "Oct 24, 2024", amount: "₹2,500.00", status: "Completed" },
  { icon: "light", label: "Light Installation", date: "Oct 18, 2024", amount: "₹4,200.50", status: "Completed" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [promoIdx, setPromoIdx] = useState(0);
  const { user } = useAuth();

  const name = user?.firstName || "User";

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Greeting + Intelligent Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Hello, {name}!</h1>
          <p className="text-gray-500 text-sm mt-0.5">What can we help you maintain today?</p>
        </div>
        <div className="flex-1 max-w-sm">
          <IntelligentSearchBar />
        </div>
      </div>

      {/* ── Offers & Promos — PRIORITY CARD (elevated shadow) ── */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(37,99,235,0.08)] border border-slate-200/70 ring-1 ring-blue-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">Offers &amp; Promos</span>
          {/* Standardized: FixHub blue, "View all" (lowercase l) */}
          <button className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">View all</button>
        </div>

        {/* ── Promo Banner — rich background with pattern + illustration dots ── */}
        <div className="relative rounded-xl overflow-hidden min-h-[100px] flex items-center"
          style={{
            background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)",
          }}
        >
          {/* Decorative dot-grid pattern */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }} />
          {/* Soft glow orbs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-300/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 right-16 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
          {/* Abstract wrench/tool silhouette */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>

          <div className="relative z-10 p-5 flex-1">
            {/* Badge */}
            <span className="inline-block text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full mb-2 tracking-wide uppercase">
              {promos[promoIdx].badge}
            </span>
            <p className="text-white font-black text-xl leading-tight">{promos[promoIdx].title}</p>
            <p className="text-blue-100 text-sm mt-1 font-medium">{promos[promoIdx].sub}</p>
          </div>
        </div>

        {/* ── Pill-shaped Carousel Dots ── */}
        <div className="flex justify-center gap-1.5 mt-3">
          {promos.map((_, i) => (
            <button
              key={i}
              onClick={() => setPromoIdx(i)}
              aria-label={`Promo ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === promoIdx
                  ? "w-6 h-2 bg-[#2563EB]"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Services Categories — PRIORITY CARD (elevated, but lighter than Offers) ── */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-200/70">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-800">Services Categories</span>
          {/* Standardized: FixHub blue, "View all" consistent capitalization */}
          <button className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">View all</button>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {services.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-[#2563EB]/40 hover:bg-blue-50/60 hover:shadow-sm active:scale-[0.97] transition-all duration-150 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50/60 border border-blue-100/50 flex items-center justify-center group-hover:bg-blue-100/60 transition-colors">
                <Icon />
              </div>
              <span className="text-[11px] text-gray-600 font-semibold group-hover:text-[#2563EB] transition-colors leading-tight text-center">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Activity — SECONDARY CARD (subtle shadow, clearly subordinate) ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-800">Recent Activity</span>
          <button className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">View all</button>
        </div>

        <div className="divide-y divide-gray-50 space-y-0">
          {recentActivity.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              {/* Consistent icon container — same shape/color, only SVG differs */}
              <ActivityIconContainer>
                {item.icon === "ac" ? <ACActivitySVG /> : <LightSVG />}
              </ActivityIconContainer>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{item.date}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">{item.amount}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
