"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface PendingService {
  _id: string;
  title: string;
  category: string;
  shortDescription: string;
  basePrice: number;
  priceUnit: "flat" | "per_hour" | "per_sqft";
  estimatedDuration: string;
  imageUrl?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  professionalId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

const PRICE_UNIT_LABEL: Record<string, string> = {
  flat: "flat",
  per_hour: "/hr",
  per_sqft: "/sqft",
};

const CATEGORY_COLORS: Record<string, string> = {
  electrician: "bg-blue-100 text-blue-700",
  plumber: "bg-cyan-100 text-cyan-700",
  ac_repair: "bg-teal-100 text-teal-700",
  painter: "bg-purple-100 text-purple-700",
  carpenter: "bg-amber-100 text-amber-700",
  cleaner: "bg-emerald-100 text-emerald-700",
  geyser: "bg-red-100 text-red-700",
  appliance_repair: "bg-indigo-100 text-indigo-700",
  pest_control: "bg-lime-100 text-lime-700",
  other: "bg-slate-100 text-slate-600",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPanelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<PendingService[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const fetchPending = useCallback(async () => {
    setFetching(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/v1/admin/pending-services", { headers, credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setServices(json.data || []);
      } else {
        toast.error("Failed to load services");
      }
    } catch {
      toast.error("Network error fetching services");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") fetchPending();
  }, [user, fetchPending]);

  const handleApprove = async (serviceId: string) => {
    setProcessingId(serviceId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/v1/admin/approve-service", {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ serviceId, action: "approve" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Service approved and is now live!");
        setServices((prev) =>
          prev.map((s) => (s._id === serviceId ? { ...s, approvalStatus: "approved" } : s))
        );
      } else {
        toast.error(json.message || "Failed to approve service");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (serviceId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setProcessingId(serviceId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/v1/admin/approve-service", {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ serviceId, action: "reject", rejectionReason }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Service rejected. Professional has been notified.");
        setServices((prev) =>
          prev.map((s) => (s._id === serviceId ? { ...s, approvalStatus: "rejected" } : s))
        );
        setRejectingId(null);
        setRejectionReason("");
      } else {
        toast.error(json.message || "Failed to reject service");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || !user) return null;
  if (user.role !== "admin") return null;

  const filtered = filter === "all" ? services : services.filter((s) => s.approvalStatus === filter);
  const counts = {
    all: services.length,
    pending: services.filter((s) => s.approvalStatus === "pending").length,
    approved: services.filter((s) => s.approvalStatus === "approved").length,
    rejected: services.filter((s) => s.approvalStatus === "rejected").length,
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin — Service Approvals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve or reject service listings submitted by professionals.
          </p>
        </div>
        <button
          onClick={fetchPending}
          disabled={fetching}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shrink-0 self-start sm:self-auto disabled:opacity-50"
        >
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={fetching ? "animate-spin" : ""}
          >
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.95" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", count: counts.pending, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          { label: "Approved", count: counts.approved, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Rejected", count: counts.rejected, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
        ].map(({ label, count, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl px-4 py-3 text-center`}>
            <p className={`text-2xl font-extrabold ${color}`}>{count}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filter === tab
                ? tab === "pending"
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : tab === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : tab === "rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-300"
                  : "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-1.5 text-[10px] opacity-70">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-24 bg-slate-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-slate-100 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 bg-slate-100 rounded-xl flex-1" />
                  <div className="h-8 bg-slate-100 rounded-xl flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-700">
            {filter === "pending" ? "No pending services to review" : `No ${filter} services`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === "pending"
              ? "All submissions have been reviewed. Check back later."
              : "Switch to a different filter to see other services."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((service) => {
            const proName =
              service.professionalId
                ? `${service.professionalId.firstName || ""} ${service.professionalId.lastName || ""}`.trim()
                : "Unknown Professional";
            const isProcessing = processingId === service._id;
            const isRejecting = rejectingId === service._id;

            return (
              <div
                key={service._id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
                  service.approvalStatus === "pending"
                    ? "border-amber-200/80"
                    : service.approvalStatus === "approved"
                    ? "border-emerald-200/80"
                    : "border-rose-200/80"
                }`}
              >
                {/* Image header */}
                <div
                  className="h-24 relative"
                  style={{
                    background: service.imageUrl
                      ? `url(${service.imageUrl}) center/cover no-repeat`
                      : "linear-gradient(135deg,#1e3a8a,#2563eb)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${CATEGORY_COLORS[service.category] || CATEGORY_COLORS.other}`}>
                      {service.category.replace(/_/g, " ")}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                      service.approvalStatus === "pending" ? "bg-amber-100 text-amber-700"
                      : service.approvalStatus === "approved" ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                    }`}>
                      {service.approvalStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{service.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{service.shortDescription}</p>
                  </div>

                  {/* Professional info */}
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {(proName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{proName || "Unknown"}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {service.professionalId?.email || "—"}
                        {service.professionalId?.phoneNumber ? ` · ${service.professionalId.phoneNumber}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Price / duration / date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">
                      Rs {service.basePrice.toLocaleString()}
                      <span className="text-[10px] font-medium text-slate-400 ml-0.5">{PRICE_UNIT_LABEL[service.priceUnit]}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{service.estimatedDuration}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(service.createdAt)}</span>
                  </div>

                  {/* Rejection reason textarea */}
                  {isRejecting && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Rejection reason <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Tell the professional why this listing was rejected…"
                        rows={2}
                        className="w-full rounded-xl border border-rose-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 resize-none"
                      />
                    </div>
                  )}

                  {/* Actions — only for pending */}
                  {service.approvalStatus === "pending" && (
                    <div className="flex items-center gap-2 pt-1">
                      {!isRejecting ? (
                        <>
                          <button
                            onClick={() => handleApprove(service._id)}
                            disabled={isProcessing}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                          >
                            {isProcessing ? (
                              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" opacity="0.25" />
                                <path d="M4 12a8 8 0 018-8" />
                              </svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectingId(service._id); setRejectionReason(""); }}
                            disabled={isProcessing}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReject(service._id)}
                            disabled={isProcessing}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                          >
                            {isProcessing ? "Rejecting…" : "Confirm Reject"}
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                            disabled={isProcessing}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Already-processed label */}
                  {service.approvalStatus !== "pending" && (
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
                      service.approvalStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${service.approvalStatus === "approved" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {service.approvalStatus === "approved"
                        ? "Approved — professional has been notified"
                        : "Rejected — professional has been notified"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
