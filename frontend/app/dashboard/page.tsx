"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

// ─── Service Category Icons ────────────────────────────────────────────────────
const ElectricianIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(37,99,235,0.08)" />
  </svg>
);

const PlumberIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const PainterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="8" rx="2" fill="rgba(37,99,235,0.08)" />
    <path d="M5 11v4" />
    <rect x="3" y="15" width="4" height="5" rx="1" fill="rgba(37,99,235,0.08)" />
    <line x1="17" y1="7" x2="21" y2="7" />
  </svg>
);

const CarpenterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
    <path d="M17.64 15L22 10.64" />
    <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.75l-2.25-2.25H14l-.34.34-.75-.75-.34.34L9 6.5l.75.75L9 8l1.5 1.5 1.5-1.5 3 3z" />
  </svg>
);

const ACIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="9" rx="2" fill="rgba(37,99,235,0.08)" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 19c0-2 2-4 6-4s6 2 6 4" />
    <circle cx="8" cy="8" r="1" fill="#2563EB" />
    <circle cx="12" cy="8" r="1" fill="#2563EB" />
    <circle cx="16" cy="8" r="1" fill="#2563EB" />
  </svg>
);

function ActivityIconContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
      {children}
    </div>
  );
}

const ACActivitySVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="9" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 19c0-2 2-4 6-4s6 2 6 4" />
  </svg>
);

const LightSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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

const services = [
  { label: "Electrician", value: "electrician", icon: ElectricianIcon },
  { label: "Plumber",     value: "plumber", icon: PlumberIcon },
  { label: "Painter",     value: "painter", icon: PainterIcon },
  { label: "Carpenter",   value: "carpenter", icon: CarpenterIcon },
  { label: "AC Repair",   value: "ac_repair", icon: ACIcon },
];

const promos = [
  { title: "Get 30% Off",      sub: "on your first Geyser Service!", badge: "Limited Time" },
  { title: "Free Inspection",  sub: "on all electrical checkups this month!", badge: "This Month" },
  { title: "AC Deep Clean",    sub: "Flat Rs 500 off — limited slots!", badge: "Few Slots Left" },
];

const recentActivity = [
  { icon: "ac",    label: "AC Maintenance",     date: "Oct 24, 2024", amount: "Rs 2,500.00", status: "Completed" },
  { icon: "light", label: "Light Installation", date: "Oct 18, 2024", amount: "Rs 4,200.50", status: "Completed" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const name = user?.firstName || "User";

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hello, {name}!</h1>
        <p className="text-sm text-slate-500 mt-1">What can we help you maintain today?</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-semibold text-slate-900">Offers &amp; Promos</span>
          <Link href="/dashboard/offers" className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promos.map((p, idx) => {
            const gradients = [
              "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
              "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              "linear-gradient(135deg, #065F46 0%, #10B981 100%)"
            ];
            return (
              <div 
                key={idx}
                className="relative rounded-xl overflow-hidden min-h-[110px] flex items-center shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                style={{ background: gradients[idx] }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
                <div className="relative z-10 p-4">
                  <span className="inline-block text-[9px] font-extrabold bg-white/25 text-white px-2 py-0.5 rounded-full mb-1.5 tracking-wider uppercase">{p.badge}</span>
                  <p className="text-white font-extrabold text-sm leading-snug">{p.title}</p>
                  <p className="text-blue-50 text-[11px] mt-0.5 font-medium leading-tight">{p.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[15px] font-semibold text-slate-900">Services Categories</span>
          <Link href="/dashboard/services" className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">View all</Link>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {services.map(({ label, value, icon: Icon }) => (
            <Link href={`/dashboard/services?category=${value}`} key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-sm active:scale-[0.97] transition-all duration-150 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50/60 border border-blue-100/50 flex items-center justify-center group-hover:bg-blue-100/60 transition-colors">
                <Icon />
              </div>
              <span className="text-[11px] text-slate-600 font-semibold group-hover:text-blue-600 transition-colors leading-tight text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[15px] font-semibold text-slate-900">Recent Activity</span>
          <button className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">View all</button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((item) => (
            <div key={item.label} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <ActivityIconContainer>
                {item.icon === "ac" ? <ACActivitySVG /> : <LightSVG />}
              </ActivityIconContainer>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-600 mt-0.5">{item.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-slate-600 font-semibold">{item.amount}</p>
                <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-700 mt-1">
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
