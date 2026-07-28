'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import CreateServiceForm from "./CreateServiceForm";
import { apiFetch } from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import { downloadReceiptPdf, downloadJobsReportPdf, JobReportEntry } from "../../../lib/receipt-pdf";
import { Search, Download, Ticket, PlusCircle, CheckCircle2, Clock, AlertTriangle, ShieldCheck, DollarSign, Briefcase, ChevronRight, Wallet, MapPin, Calendar, User as UserIcon } from "lucide-react";

interface BookingDoc {
  _id: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | string;
  escrowStatus: string;
  amount: number;
  scheduledAt: string;
  address: string;
  notes?: string;
  serviceId?: { title?: string; category?: string; slug?: string } | string;
  customerId?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } | string;
}

function personName(p: BookingDoc['customerId']) {
  if (!p || typeof p === 'string') return 'Customer';
  return `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim() || 'Customer';
}

function customerEmail(p: BookingDoc['customerId']) {
  if (!p || typeof p === 'string') return undefined;
  return (p as any).email;
}

function customerPhone(p: BookingDoc['customerId']) {
  if (!p || typeof p === 'string') return undefined;
  return (p as any).phoneNumber;
}

function serviceTitle(s: BookingDoc['serviceId']) {
  if (!s || typeof s === 'string') return 'Service';
  return (s as any).title || 'Service';
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  confirmed:   { label: 'Confirmed',   dot: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  in_progress: { label: 'In Progress', dot: 'bg-indigo-500',  bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  completed:   { label: 'Completed',   dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled:   { label: 'Cancelled',   dot: 'bg-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-600',    border: 'border-slate-200' },
};

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export default function ProDashboard() {
  const { user } = useAuth();
  const name = user?.firstName || "Professional";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [wallet, setWallet] = useState<{ balance: number; held: number } | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingDoc | null>(null);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const [bookingRes, walletRes] = await Promise.all([
        apiFetch<{ data: BookingDoc[] }>(API.BOOKINGS.LIST),
        apiFetch<{ data: { wallet: { balance: number; held: number } } }>(API.WALLET.GET).catch(() => null),
      ]);
      setBookings(bookingRes.data || []);
      if (walletRes?.data?.wallet) setWallet(walletRes.data.wallet);
    } catch {
      // silently fail
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
      toast.success(
        action === 'start' ? 'Job started!' :
        action === 'complete' ? 'Job completed & payment released!' :
        'Job updated!'
      );
      loadJobs();
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  const handleDownloadJobsReport = () => {
    const proName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Professional';
    const entries: JobReportEntry[] = bookings.map(b => ({
      jobId: b._id,
      serviceTitle: serviceTitle(b.serviceId),
      customerName: personName(b.customerId),
      status: b.status,
      amount: b.amount,
      scheduledAt: b.scheduledAt,
      address: b.address,
      escrowStatus: b.escrowStatus,
    }));
    downloadJobsReportPdf(proName, entries);
    toast.success('Downloading FixHub Jobs PDF report…');
  };

  const handleDownloadSingleReceipt = (b: BookingDoc) => {
    downloadReceiptPdf({
      orderNumber: b._id,
      orderId: b._id,
      invoiceNumber: `INV-${b._id.slice(-8).toUpperCase()}`,
      service: serviceTitle(b.serviceId),
      status: b.status,
      escrowStatus: b.escrowStatus,
      amount: b.amount,
      scheduledAt: b.scheduledAt,
      address: b.address,
      customer: personName(b.customerId),
      customerEmail: customerEmail(b.customerId),
      customerPhone: customerPhone(b.customerId),
      professional: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Professional',
      notes: b.notes,
    });
  };

  // ── Unverified state ─────────────────────────────────────────────────────────
  if (!user?.isVerified) {
    return (
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {name}!</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Welcome to your Professional Dashboard.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-900">Account Pending Verification</h2>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Your account is currently under review by our operations team. Once your Industrial/Business License is verified by an administrator, you will be able to accept job requests, manage services, and receive escrow payments.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/dashboard/support"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white text-xs font-semibold px-4 py-2 hover:bg-slate-800 transition-colors"
                >
                  <Ticket className="h-4 w-4" />
                  Raise Support Ticket
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white text-amber-900 text-xs font-semibold px-4 py-2 hover:bg-amber-50 transition-colors"
                >
                  Upload Documents
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Computations ──────────────────────────────────────────────────────────────
  const activeJobs    = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');
  const completedJobs = bookings.filter(b => b.status === 'completed');
  const cancelledJobs = bookings.filter(b => b.status === 'cancelled');
  const totalEarnings = completedJobs.reduce((sum, b) => sum + (b.amount || 0), 0);

  const filteredBookings = bookings.filter((b) => {
    let matchTab = true;
    if (activeTab === 'active') matchTab = b.status === 'confirmed' || b.status === 'in_progress';
    if (activeTab === 'completed') matchTab = b.status === 'completed';
    if (activeTab === 'cancelled') matchTab = b.status === 'cancelled';

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchTab;

    const title = serviceTitle(b.serviceId).toLowerCase();
    const cust = personName(b.customerId).toLowerCase();
    const addr = (b.address || '').toLowerCase();
    const idStr = b._id.toLowerCase();

    return matchTab && (title.includes(q) || cust.includes(q) || addr.includes(q) || idStr.includes(q));
  });

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">

      {/* ── Clean Header Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900">Hello, {name}! 👋</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Manage your professional bookings, wallet, and completed jobs.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowCreateForm(v => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-colors shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            {showCreateForm ? 'Close' : 'Post Service'}
          </button>

          {wallet && (
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-right shadow-xs flex items-center gap-2.5">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Wallet</p>
                <p className="text-xs font-black text-slate-900 leading-tight">NPR {wallet.balance.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Grid (Gradient Cards) ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Total Earnings',
            value: `NPR ${totalEarnings.toLocaleString()}`,
            sub: `${completedJobs.length} completed jobs`,
            gradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            icon: DollarSign,
          },
          {
            label: 'Completed Jobs',
            value: completedJobs.length.toString(),
            sub: 'Finished & verified',
            gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
            icon: CheckCircle2,
          },
          {
            label: 'Active Now',
            value: activeJobs.length.toString(),
            sub: 'Confirmed / In Progress',
            gradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
            icon: Clock,
          },
          {
            label: 'Total Jobs',
            value: bookings.length.toString(),
            sub: `${cancelledJobs.length} cancelled`,
            gradient: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)',
            icon: Briefcase,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between p-4 min-h-[105px]"
              style={{ background: stat.gradient }}
            >
              <div className="relative z-10 flex items-start justify-between">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{stat.label}</p>
                <Icon className="h-4 w-4 text-white/80" />
              </div>
              <div className="relative z-10 mt-2">
                <p className="text-xl font-black text-white leading-tight">{stat.value}</p>
                <p className="text-[10px] text-white/75 mt-0.5 font-medium">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create Service Modal (Backdrop Blur) ───────────────────────────── */}
      {showCreateForm && (
        /* Backdrop — click outside to close, scrollable so modal is never clipped */
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md overflow-y-auto custom-scrollbar"
          onClick={() => setShowCreateForm(false)}
        >
          {/* Centering wrapper — min-h-full keeps card vertically centred; padding gives breathing room */}
          <div className="min-h-full flex items-center justify-center p-5 sm:p-8">
            {/* Card — stopPropagation so clicks inside don't close the modal */}
            <div
              className="bg-white rounded-3xl max-w-xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Post a New Service</h2>
                  <p className="text-xs text-slate-500 mt-0.5">List your service on the FixHub catalog for local clients.</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold shrink-0"
                >
                  ✕
                </button>
              </div>
              {/* Form — no fixed height; grows naturally, outer backdrop scrolls */}
              <div className="px-6">
                <CreateServiceForm onSuccess={() => { setShowCreateForm(false); toast.success("Service posted!"); loadJobs(); }} />
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ── Uncluttered Clean Jobs Section ───────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-xs overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-4 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {(
              [
                { id: 'all',       label: 'All',       count: bookings.length },
                { id: 'active',    label: 'Active',    count: activeJobs.length },
                { id: 'completed', label: 'Completed', count: completedJobs.length },
                { id: 'cancelled', label: 'Cancelled', count: cancelledJobs.length },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === t.id
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job or customer..."
                className="w-full rounded-xl border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <button
              onClick={handleDownloadJobsReport}
              disabled={bookings.length === 0}
              title="Download Jobs PDF Report"
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-40"
            >
              <Download className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Clean Job Table */}
        {loadingJobs ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Briefcase className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No jobs in this view</p>
            <p className="text-xs text-slate-400 mt-0.5">Your bookings will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-700 bg-slate-50/60 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Scheduled</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 font-medium text-slate-700">
                {filteredBookings.map((b) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.confirmed;
                  const canStart    = b.status === 'confirmed';
                  const canComplete = b.status === 'in_progress';
                  const isCompleted = b.status === 'completed';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs">{serviceTitle(b.serviceId)}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{b._id.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        {personName(b.customerId)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(b.scheduledAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        NPR {b.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {canStart && (
                            <button
                              onClick={() => act(b._id, 'start')}
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-[11px] font-bold transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {canComplete && (
                            <button
                              onClick={() => act(b._id, 'complete')}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {isCompleted && (
                            <button
                              onClick={() => handleDownloadSingleReceipt(b)}
                              title="Download PDF Invoice"
                              className="p-1 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-slate-600"
                            >
                              <Download className="h-3.5 w-3.5 text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Minimal Booking Modal ───────────────────────────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-xs" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{serviceTitle(selectedBooking.serviceId)}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedBooking._id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="font-bold text-slate-800">{personName(selectedBooking.customerId)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Status:</span>
                <span className="font-bold text-blue-600 capitalize">{selectedBooking.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Escrow Status:</span>
                <span className="font-bold text-emerald-600 capitalize">{selectedBooking.escrowStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Total Amount:</span>
                <span className="font-extrabold text-slate-900 text-sm">NPR {selectedBooking.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Scheduled:</span>
                <span className="font-medium text-slate-700">{new Date(selectedBooking.scheduledAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Service Address:</span>
                <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium text-slate-700">{selectedBooking.address}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDownloadSingleReceipt(selectedBooking)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                PDF Receipt
              </button>
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => act(selectedBooking._id, 'start')}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 transition-colors"
                >
                  Start Job
                </button>
              )}
              {selectedBooking.status === 'in_progress' && (
                <button
                  onClick={() => act(selectedBooking._id, 'complete')}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 transition-colors"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
