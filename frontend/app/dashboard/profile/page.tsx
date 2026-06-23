"use client";

import { useState } from "react";
import Link from "next/link";

const bookingHistory = [
  { id: "#FH-1042", service: "Plumbing", pro: "Ram Bahadur", date: "Jun 12, 2025", status: "Completed", amount: "NPR 1,800" },
  { id: "#FH-1031", service: "Electrical", pro: "Sanjay Lama", date: "May 28, 2025", status: "Completed", amount: "NPR 2,500" },
  { id: "#FH-1018", service: "HVAC Service", pro: "Prakash Rai", date: "May 10, 2025", status: "Cancelled", amount: "NPR 3,200" },
  { id: "#FH-1005", service: "Painting", pro: "Bikash Shrestha", date: "Apr 22, 2025", status: "Completed", amount: "NPR 5,000" },
];

const statusColors: Record<string, string> = {
  Completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

type Tab = "bookings" | "saved" | "settings";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Prashant Shrestha");
  const [phone, setPhone] = useState("+977 98XXXXXXXX");
  const [address, setAddress] = useState("Lalitpur, Kathmandu Valley");

  return (
    <div className="min-h-screen bg-[#070B14] text-white font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#070B14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Fix<span className="text-[#2196F3]">Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1565C0] to-[#2196F3] flex items-center justify-center text-xs font-bold">
              PS
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">

          {/* ── SIDEBAR CARD ── */}
          <aside className="space-y-4">
            {/* Avatar + name */}
            <div className="bg-[#0D1525] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1565C0] to-[#2196F3] flex items-center justify-center text-2xl font-bold">
                  PS
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-[#2196F3] rounded-full flex items-center justify-center text-xs hover:bg-[#1976D2] transition-colors">
                  ✎
                </button>
              </div>
              <h2 className="font-semibold text-white">{name}</h2>
              <p className="text-white/40 text-xs mt-1">{address}</p>
              <div className="mt-4 w-full pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-white">4</p>
                  <p className="text-xs text-white/30">Bookings</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">3</p>
                  <p className="text-xs text-white/30">Completed</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="bg-[#0D1525] border border-white/5 rounded-2xl overflow-hidden">
              {(["bookings", "saved", "settings"] as Tab[]).map((tab) => {
                const labels: Record<Tab, string> = {
                  bookings: "📋  My Bookings",
                  saved: "🔖  Saved Pros",
                  settings: "⚙️  Account Settings",
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-5 py-3.5 text-sm transition-colors border-b border-white/5 last:border-0 ${
                      activeTab === tab
                        ? "bg-[#1565C0]/20 text-[#60AAFF]"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            <button className="w-full text-sm text-red-400/70 hover:text-red-400 transition-colors py-2">
              Sign out
            </button>
          </aside>

          {/* ── MAIN PANEL ── */}
          <div className="space-y-6">

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h1 className="text-xl font-bold">My Bookings</h1>
                  <Link
                    href="/"
                    className="text-sm bg-gradient-to-r from-[#1565C0] to-[#2196F3] hover:from-[#1976D2] hover:to-[#42A5F5] text-white px-4 py-2 rounded-lg transition-all"
                  >
                    + New Booking
                  </Link>
                </div>

                <div className="space-y-3">
                  {bookingHistory.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#0D1525] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{b.service}</span>
                          <span className="text-white/20 text-xs">·</span>
                          <span className="text-white/40 text-xs">{b.id}</span>
                        </div>
                        <p className="text-white/40 text-xs">
                          {b.pro} · {b.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:text-right">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[b.status]}`}
                        >
                          {b.status}
                        </span>
                        <span className="text-white/60 text-sm font-medium">{b.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SAVED PROS TAB */}
            {activeTab === "saved" && (
              <div>
                <h1 className="text-xl font-bold mb-5">Saved Pros</h1>
                <div className="bg-[#0D1525] border border-white/5 rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-3">🔖</p>
                  <p className="text-white/40 text-sm">No saved pros yet.</p>
                  <p className="text-white/25 text-xs mt-1">Bookmark a pro after your service to find them again easily.</p>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h1 className="text-xl font-bold">Account Settings</h1>
                  <button
                    onClick={() => setEditing(!editing)}
                    className={`text-sm px-4 py-2 rounded-lg transition-all ${
                      editing
                        ? "bg-[#2196F3] text-white"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {editing ? "Save changes" : "Edit profile"}
                  </button>
                </div>

                <div className="bg-[#0D1525] border border-white/5 rounded-2xl divide-y divide-white/5">
                  {[
                    { label: "Full name", value: name, setter: setName, type: "text" },
                    { label: "Phone", value: phone, setter: setPhone, type: "tel" },
                    { label: "Address", value: address, setter: setAddress, type: "text" },
                  ].map((field) => (
                    <div key={field.label} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-white/30 text-xs uppercase tracking-widest w-32 flex-shrink-0">
                        {field.label}
                      </span>
                      {editing ? (
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="flex-1 bg-[#111827] border border-[#2196F3]/30 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[#2196F3] transition-colors"
                        />
                      ) : (
                        <span className="text-white text-sm">{field.value}</span>
                      )}
                    </div>
                  ))}

                  {/* Email — read-only */}
                  <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-white/30 text-xs uppercase tracking-widest w-32 flex-shrink-0">Email</span>
                    <span className="text-white/50 text-sm">prashant@example.com</span>
                    <span className="ml-auto text-xs text-white/20 border border-white/10 rounded px-2 py-0.5">Verified</span>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="mt-6 bg-[#0D1525] border border-red-500/10 rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-red-400 mb-1">Danger zone</h3>
                  <p className="text-white/30 text-xs mb-4">Permanently delete your account and all data. This cannot be undone.</p>
                  <button className="text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors">
                    Delete account
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
