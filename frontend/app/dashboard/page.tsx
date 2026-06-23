"use client";

import { useState } from "react";

// Service category icons
const ElectricianIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const PlumberIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const PainterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
);
const CarpenterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
    <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const ACIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
  </svg>
);

const ACActivityIcon = () => (
  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  </div>
);
const LightIcon = () => (
  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  </div>
);

const services = [
  { label: "Electrician", icon: ElectricianIcon },
  { label: "Plumber", icon: PlumberIcon },
  { label: "Painter", icon: PainterIcon },
  { label: "Carpenter", icon: CarpenterIcon },
  { label: "AC Repair", icon: ACIcon },
];

const promos = [
  { title: "Get 30% Off", sub: "on your first Geyser Service!" },
  { title: "Free Inspection", sub: "on all electrical checkups this month!" },
  { title: "AC Deep Clean", sub: "Flat ₹500 off — limited slots!" },
];

const recentActivity = [
  { icon: "ac", label: "AC Maintenance", date: "Oct 24, 2024", amount: "₹2500.00", status: "Completed" },
  { icon: "light", label: "Light Installation", date: "Oct 18, 2024", amount: "₹4200.50", status: "Completed" },
];

import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [promoIdx, setPromoIdx] = useState(0);
  const { user } = useAuth();

  const name = user?.firstName || "User";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Greeting + Search */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Hello, {name}!</h1>
          <p className="text-gray-400 text-sm mt-0.5">What can we help you maintain today?</p>
        </div>
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search for any home service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>
      </div>

      {/* Offers & Promos */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Offers &amp; Promos</span>
          <button className="text-xs text-[#2563EB] font-medium hover:underline">View all</button>
        </div>

        {/* Promo banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#2563EB] to-[#3B82F6] p-6 min-h-[90px] flex items-center">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <p className="text-white font-bold text-lg leading-tight">{promos[promoIdx].title}</p>
            <p className="text-blue-100 text-sm mt-0.5">{promos[promoIdx].sub}</p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {promos.map((_, i) => (
            <button
              key={i}
              onClick={() => setPromoIdx(i)}
              className={`rounded-full transition-all ${
                i === promoIdx
                  ? "w-5 h-1.5 bg-[#2563EB]"
                  : "w-1.5 h-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Services Categories */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-700">Services Categories</span>
          <button className="text-xs text-[#EF4444] font-medium hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {services.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-[#2563EB]/30 hover:bg-blue-50/50 transition-all group"
            >
              <Icon />
              <span className="text-xs text-gray-600 font-medium group-hover:text-[#2563EB] transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-700">Recent Activity</span>
        </div>

        <div className="space-y-3">
          {recentActivity.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 py-2"
            >
              {item.icon === "ac" ? <ACActivityIcon /> : <LightIcon />}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-800">{item.amount}</p>
                <span className="inline-block mt-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">
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
