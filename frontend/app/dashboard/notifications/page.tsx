"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Search, 
  X,
  ArrowRight
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  body: string;
  time: string;
  date: string;
  type: "booking" | "confirm" | "done" | "payment";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Technician on the way",
    body: "Ramesh K. is heading to your location for AC Deep Clean & Performance Service. Contact: +977 9851012345.",
    time: "2 min ago",
    date: "July 13, 2026",
    type: "booking",
    read: false,
  },
  {
    id: 2,
    title: "Booking confirmed",
    body: "Your plumbing appointment for Fri, Jul 18 is confirmed. Suman Maharjan has been assigned to your service request.",
    time: "1 hr ago",
    date: "July 13, 2026",
    type: "confirm",
    read: false,
  },
  {
    id: 3,
    title: "Service completed",
    body: "AC repair job #4821 has been marked complete. Please take a moment to rate your technician experience.",
    time: "Yesterday",
    date: "July 12, 2026",
    type: "done",
    read: true,
  },
  {
    id: 4,
    title: "Payment received",
    body: "Rs. 2,500 payment for electrical work confirmed. Invoice #INV-8827-26 has been generated and sent to your email.",
    time: "2 days ago",
    date: "July 11, 2026",
    type: "payment",
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "booking" | "payment">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Handler to mark single notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Handler to delete single notification
  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Bulk actions
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Filter & Search Logic
  const filteredNotifications = notifications.filter(n => {
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "unread" && !n.read) ||
      n.type === activeTab;
    
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const iconStyles = {
    booking: { bg: "bg-blue-50", text: "text-blue-500", icon: Calendar },
    confirm: { bg: "bg-emerald-50", text: "text-emerald-500", icon: CheckCircle },
    done: { bg: "bg-indigo-50", text: "text-indigo-500", icon: CheckCircle },
    payment: { bg: "bg-red-50", text: "text-red-500", icon: DollarSign }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your service alerts, booking status updates, and transaction receipts.
          </p>
        </div>

        {/* Bulk Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Control panel: Tabs & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {(["all", "unread", "booking", "payment"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {tab === "booking" ? "bookings" : tab === "payment" ? "payments" : tab}
              {tab === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Bell size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              There are no updates matching your criteria right now. Check back later!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(n => {
              const style = iconStyles[n.type];
              const Icon = style.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`flex gap-4 p-5 hover:bg-slate-50/50 transition-all cursor-pointer relative group ${
                    !n.read ? "bg-blue-50/10" : ""
                  }`}
                >
                  {/* Left indicator bar */}
                  {!n.read && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                    <Icon size={18} />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${n.read ? "text-slate-700" : "text-slate-900"}`}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{n.date} &bull; {n.time}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                      {n.body}
                    </p>

                    {/* Notification-type CTAs */}
                    {n.type === "booking" && (
                      <div className="pt-1">
                        <Link 
                          href="/dashboard/bookings" 
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Track live technician
                          <ArrowRight size={10} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Actions (hover delete button) */}
                  <div className="shrink-0 flex items-start gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-red-50 text-slate-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
