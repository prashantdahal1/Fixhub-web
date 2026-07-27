'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api/client';
import { API } from '../../../lib/api/endpoints';
import { downloadReceiptPdf, downloadJobsReportPdf, JobReportEntry } from '../../../lib/receipt-pdf';
import { Search, Download, FileText, CheckCircle2, Clock, XCircle, ChevronRight, Briefcase } from 'lucide-react';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';

type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
type BookingAction = 'start' | 'complete' | 'cancel';

interface BookingDoc {
  _id: string;
  status: BookingStatus;
  escrowStatus: string;
  amount: number;
  address: string;
  notes?: string;
  scheduledAt: string;
  serviceId?: { title?: string; category?: string; slug?: string } | string;
  customerId?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } | string;
  professionalId?: { firstName?: string; lastName?: string; phoneNumber?: string; averageRating?: number } | string;
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  confirmed: 'bg-blue-50 border-blue-200 text-blue-800',
  in_progress: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  completed: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  cancelled: 'bg-rose-50 border-rose-200 text-rose-700',
};

const STEPS: BookingStatus[] = ['confirmed', 'in_progress', 'completed'];

function personName(p: BookingDoc['customerId']) {
  if (!p || typeof p === 'string') return 'Unknown';
  return `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown';
}

function serviceTitle(s: BookingDoc['serviceId']) {
  if (!s || typeof s === 'string') return 'Service';
  return s.title || 'Service';
}

function orderNumber(booking: BookingDoc) {
  return booking._id;
}

function canDownloadReceipt(booking: BookingDoc) {
  return booking.status === 'completed';
}

type TabType = 'all' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BookingDoc | null>(null);
  const [acting, setActing] = useState(false);
  const [wallet, setWallet] = useState<{ balance: number; held: number } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDone, setReviewDone] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelConfirmBooking, setCancelConfirmBooking] = useState<BookingDoc | null>(null);

  const isPro = user?.role === 'professional';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const reason = params.get('reason');

      if (paymentStatus === 'success') {
        toast.success('Booking payment completed successfully! Escrow is now held.');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'failed') {
        toast.error(`Payment failed${reason ? `: ${reason.replace('_', ' ')}` : ''}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingRes, walletRes] = await Promise.all([
        apiFetch<{ data: BookingDoc[] }>(API.BOOKINGS.LIST),
        apiFetch<{ data: { wallet: { balance: number; held: number } } }>(API.WALLET.GET).catch(() => null),
      ]);
      setBookings(bookingRes.data || []);
      if (walletRes?.data?.wallet) {
        setWallet(walletRes.data.wallet);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Real-time booking status updates via WebSocket ───────────────────────────
  useRealtimeBookings({
    onBookingUpdated: (payload) => {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === payload.bookingId
            ? { ...b, status: payload.status as BookingStatus, escrowStatus: payload.escrowStatus }
            : b
        )
      );
      // Update the open detail panel if it matches
      setSelected((prev) =>
        prev && prev._id === payload.bookingId
          ? { ...prev, status: payload.status as BookingStatus, escrowStatus: payload.escrowStatus }
          : prev
      );
    },
  });

  const runAction = async (booking: BookingDoc, action: BookingAction) => {
    setActing(true);
    try {
      await apiFetch(API.BOOKINGS.STATUS(booking._id), {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      toast.success(`Booking ${action}ed`);
      await load();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const submitReview = async (booking: BookingDoc) => {
    try {
      await apiFetch(API.REVIEWS.CREATE, {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      setReviewDone((prev) => ({ ...prev, [booking._id]: true }));
      toast.success('Review submitted');
    } catch (err: any) {
      toast.error(err.message || 'Review failed');
    }
  };

  const actionsFor = (b: BookingDoc): BookingAction[] => {
    if (isPro) {
      if (b.status === 'confirmed') return ['start', 'cancel'];
      if (b.status === 'in_progress') return ['complete', 'cancel'];
      return [];
    }
    if (b.status === 'confirmed') return ['cancel'];
    return [];
  };

  const stepIndex = (status: BookingStatus) => {
    if (status === 'cancelled') return -1;
    return STEPS.indexOf(status);
  };

  const downloadReceipt = (booking: BookingDoc) => {
    const cust = booking.customerId;
    downloadReceiptPdf({
      orderNumber: orderNumber(booking),
      orderId: booking._id,
      invoiceNumber: `INV-${booking._id.slice(-8).toUpperCase()}`,
      service: serviceTitle(booking.serviceId),
      status: booking.status,
      escrowStatus: booking.escrowStatus,
      amount: booking.amount,
      scheduledAt: booking.scheduledAt,
      address: booking.address,
      customer: personName(cust),
      customerEmail: cust && typeof cust === "object" ? (cust as any).email : undefined,
      customerPhone: cust && typeof cust === "object" ? (cust as any).phoneNumber : undefined,
      professional: personName(booking.professionalId),
      notes: booking.notes,
    });
  };

  const downloadJobsReport = () => {
    const proName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Professional' : 'Professional';
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
    toast.success('Jobs report downloading…');
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchTab = activeTab === 'all' || b.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchTab;

      const title = serviceTitle(b.serviceId).toLowerCase();
      const party = (isPro ? personName(b.customerId) : personName(b.professionalId)).toLowerCase();
      const addr = (b.address || '').toLowerCase();
      const idStr = b._id.toLowerCase();

      return matchTab && (title.includes(q) || party.includes(q) || addr.includes(q) || idStr.includes(q));
    });
  }, [bookings, activeTab, searchQuery, isPro]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isPro ? 'Job Requests & Orders' : 'My Bookings'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isPro
              ? 'Manage all your job requests, start/complete tasks, and download FixHub PDF reports.'
              : 'Track status, cancel before work starts, download invoices, and review completed jobs.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {isPro && (
            <button
              onClick={downloadJobsReport}
              disabled={bookings.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 transition-colors disabled:opacity-40 shadow-xs"
            >
              <Download className="h-4 w-4 text-blue-600" />
              Download Jobs PDF Report
            </button>
          )}
          {isPro && wallet && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm">
              <p className="font-bold text-emerald-800">
                NPR {wallet.balance.toLocaleString()}
                <span className="text-emerald-600 font-normal text-xs ml-1">(held {wallet.held.toLocaleString()})</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 overflow-x-auto shrink-0">
          {(
            [
              { id: 'all',         label: 'All',         count: bookings.length },
              { id: 'confirmed',   label: 'Confirmed',   count: bookings.filter(b => b.status === 'confirmed').length },
              { id: 'in_progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in_progress').length },
              { id: 'completed',   label: 'Completed',   count: bookings.filter(b => b.status === 'completed').length },
              { id: 'cancelled',   label: 'Cancelled',   count: bookings.filter(b => b.status === 'cancelled').length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`rounded-lg px-3 py-1.5 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking, party, address..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-xs font-medium text-slate-400 py-6 text-center">Loading bookings…</p>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No bookings found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? "Try resetting your search filter." : "New bookings will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm">{serviceTitle(b.serviceId)}</h3>
                  <span className="font-mono text-[11px] font-semibold text-slate-400">#{b._id.slice(-8).toUpperCase()}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_STYLE[b.status]}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(b.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">{b.address}</span>
                </p>
                <p className="text-xs text-slate-600 font-medium pt-0.5">
                  {isPro ? `Customer: ${personName(b.customerId)}` : `Pro: ${personName(b.professionalId)}`}
                  {' · '}<strong className="text-slate-900 font-semibold">NPR {b.amount.toLocaleString()}</strong> · Escrow: <span className="capitalize text-slate-700 font-medium">{b.escrowStatus}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canDownloadReceipt(b) && (
                  <button
                    type="button"
                    onClick={() => downloadReceipt(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-blue-600" />
                    Invoice
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelected(b)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Manage / Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{serviceTitle(selected.serviceId)}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Order #{orderNumber(selected)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-sm font-semibold">
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <p>Order Number: <strong className="font-mono text-slate-800">Fixhub-{orderNumber(selected)}</strong></p>
              <p>Status: <strong className="capitalize text-blue-600">{selected.status.replace('_', ' ')}</strong></p>
              <p>Escrow Protection: <strong className="capitalize text-emerald-600">{selected.escrowStatus}</strong></p>
              <p>Total Amount: <strong className="text-slate-900 font-extrabold text-base">NPR {selected.amount.toLocaleString()}</strong></p>
              <p>Scheduled: {new Date(selected.scheduledAt).toLocaleString()}</p>
              <p>Service Address: {selected.address}</p>
              {selected.notes && <p>Notes: <em>{selected.notes}</em></p>}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {canDownloadReceipt(selected) && (
                <button
                  type="button"
                  onClick={() => downloadReceipt(selected)}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF Invoice / Receipt
                </button>
              )}
              {actionsFor(selected).map((action) => (
                <button
                  key={action}
                  disabled={acting}
                  onClick={() => {
                    if (action === 'cancel') {
                      setCancelConfirmBooking(selected);
                    } else {
                      runAction(selected, action);
                    }
                  }}
                  className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
                    action === 'cancel' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {action === 'start' ? 'Start Work' : action === 'complete' ? 'Mark Completed' : 'Cancel Booking'}
                </button>
              ))}
            </div>

            {!isPro && selected.status === 'completed' && !reviewDone[selected._id] && (
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Leave a review</h3>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the service?"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-h-[80px]"
                />
                <button
                  onClick={() => submitReview(selected)}
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2"
                >
                  Submit review
                </button>
              </div>
            )}
            {reviewDone[selected._id] && (
              <p className="text-sm text-emerald-700 font-medium">Thanks for your review!</p>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelConfirmBooking}
        onClose={() => setCancelConfirmBooking(null)}
        onConfirm={async () => {
          if (cancelConfirmBooking) {
            await runAction(cancelConfirmBooking, 'cancel');
            setCancelConfirmBooking(null);
          }
        }}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
        isLoading={acting}
      />
    </div>
  );
}
