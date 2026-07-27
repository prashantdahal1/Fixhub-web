"use client";

import { useState, useEffect } from "react";
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
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchNotifications, upsertNotification, type NotificationItem } from "../../../lib/api/notifications";

type Notification = NotificationItem;

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "booking" | "payment">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    const refresh = () => {
      fetchNotifications()
        .then(setNotifications)
        .catch((err) => console.error("Error fetching notifications:", err));
    };

    refresh();

    if ("EventSource" in window) {
      eventSource = new EventSource("/api/v1/notifications/stream", { withCredentials: true });
      eventSource.addEventListener("notification", (event) => {
        const notification = JSON.parse((event as MessageEvent).data) as Notification;
        setNotifications((items) => upsertNotification(items, notification));
      });
      eventSource.onerror = () => {
        eventSource?.close();
        if (!fallbackInterval) fallbackInterval = setInterval(refresh, 10000);
      };
    } else {
      fallbackInterval = setInterval(refresh, 10000);
    }

    return () => {
      eventSource?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [user]);

  // Handler to mark single notification as read
  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
    } catch (_) {}
  };

  // Handler to delete single notification
  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await fetch(`/api/v1/notifications/${id}`, { method: "DELETE" });
    } catch (_) {}
  };

  // Bulk actions
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch("/api/v1/notifications/read-all", { method: "PATCH" });
    } catch (_) {}
  };

  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const clearAll = async () => {
    setShowClearAllConfirm(true);
  };

  const confirmClearAll = async () => {
    setNotifications([]);
    setShowClearAllConfirm(false);
    try {
      await fetch("/api/v1/notifications/clear-all", { method: "DELETE" });
    } catch (_) {}
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
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your service bookings, support ticket replies, and account updates.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/50 border border-transparent rounded-lg transition-all"
            >
              <Trash2 size={13} />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Tabs and search filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white border border-slate-200 p-2.5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "unread", "booking", "payment"] as const).map((tab) => {
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            const count = tab === "unread" ? unreadCount : undefined;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  activeTab === tab
                    ? "bg-[#EFF6FF] text-[#2563EB] border-blue-200"
                    : "bg-white text-slate-500 border-transparent hover:text-slate-700"
                }`}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500 text-white font-bold leading-none">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full sm:w-60 pl-8.5 pr-8 py-1.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
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
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Bell size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              There are no updates matching your criteria right now. Check back later!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(n => {
              const style = iconStyles[n.type] || iconStyles.booking;
              const Icon = style.icon;

              return (
                <div
                  key={n._id}
                  onClick={() => !n.read && markAsRead(n._id)}
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
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(n.createdAt).toLocaleDateString()} &bull; {formatRelativeTime(n.createdAt)}
                      </span>
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
                        deleteNotification(n._id);
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

      <ConfirmModal
        isOpen={showClearAllConfirm}
        title="Clear All Notifications?"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
        onClose={() => setShowClearAllConfirm(false)}
        onConfirm={confirmClearAll}
      />
    </div>
  );
}
