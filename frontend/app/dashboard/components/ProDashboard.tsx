'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import CreateServiceForm from "./CreateServiceForm";
import { apiFetch } from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";

interface IncomingBooking {
  _id: string;
  status: string;
  amount: number;
  scheduledAt: string;
  address: string;
  serviceId?: { title?: string } | string;
  customerId?: { firstName?: string; lastName?: string } | string;
}

export default function ProDashboard() {
  const { user } = useAuth();
  const name = user?.firstName || "Professional";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bookings, setBookings] = useState<IncomingBooking[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await apiFetch<{ data: IncomingBooking[] }>(API.BOOKINGS.LIST);
      setBookings((res.data || []).filter((b) => b.status !== "cancelled"));
    } catch {
      // leave empty
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (user?.isVerified) loadJobs();
  }, [user?.isVerified]);

  const act = async (id: string, action: string) => {
    try {
      await apiFetch(API.BOOKINGS.STATUS(id), {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      toast.success(`Booking ${action}ed`);
      loadJobs();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  if (!user?.isVerified) {
    return (
      <div className="max-w-5xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {name}!</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome to your Professional Dashboard.</p>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-lg font-semibold text-yellow-800">Account Pending Verification</h2>
          <p className="text-sm text-yellow-700 mt-2">
            Your account is currently under review. Once your Industrial/Business License is verified by an administrator, you will be able to post and manage your services.
          </p>
        </div>
      </div>
    );
  }

  const activeRequests = bookings.filter((b) => b.status === "confirmed");

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {name}!</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your services and bookings.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          {showCreateForm ? "Cancel" : "Post New Service"}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create a New Service</h2>
          <CreateServiceForm onSuccess={() => setShowCreateForm(false)} />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Incoming Jobs</h2>
          <Link href="/dashboard/bookings" className="text-xs font-semibold text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {loadingJobs ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : activeRequests.length === 0 ? (
          <p className="text-sm text-slate-500">No confirmed job requests right now.</p>
        ) : (
          <div className="space-y-3">
            {activeRequests.slice(0, 5).map((b) => {
              const title = typeof b.serviceId === "object" ? b.serviceId?.title : "Service";
              const customer =
                typeof b.customerId === "object"
                  ? `${b.customerId?.firstName || ""} ${b.customerId?.lastName || ""}`.trim()
                  : "Customer";
              return (
                <div key={b._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500">
                      {customer} · {new Date(b.scheduledAt).toLocaleString()} · NPR {b.amount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => act(b._id, "cancel")}
                      className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Active Services</h2>
        <p className="text-sm text-slate-500">
          Post services above, then manage bookings from{" "}
          <Link href="/dashboard/bookings" className="text-blue-600 font-semibold hover:underline">
            Bookings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
