'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api/client';
import { API } from '../../../lib/api/endpoints';

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
  cancelled: 'bg-slate-100 border-slate-200 text-slate-600',
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

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isPro ? 'Job Requests' : 'My Bookings'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isPro
              ? 'Start and complete jobs. Escrow releases on completion.'
              : 'Track status, cancel before work starts, and review completed jobs.'}
          </p>
        </div>
        {isPro && wallet && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold text-slate-800">
              Wallet Balance: NPR {wallet.balance.toLocaleString()}
              <span className="text-slate-400 font-normal ml-2">
                (held {wallet.held.toLocaleString()})
              </span>
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">No bookings yet.</p>
          {!isPro && (
            <p className="text-xs text-slate-400 mt-1">Browse services and book one to get started.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const si = stepIndex(b.status);
            return (
              <button
                key={b._id}
                type="button"
                onClick={() => setSelected(b)}
                className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{serviceTitle(b.serviceId)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(b.scheduledAt).toLocaleString()} · {b.address}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isPro ? `Customer: ${personName(b.customerId)}` : `Pro: ${personName(b.professionalId)}`}
                      {' · '}NPR {b.amount.toLocaleString()} · escrow {b.escrowStatus}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[b.status]}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
                {si >= 0 && (
                  <div className="mt-3 flex gap-1">
                    {STEPS.map((s, i) => (
                      <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full ${i <= si ? 'bg-blue-600' : 'bg-slate-100'}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{serviceTitle(selected.serviceId)}</h2>
                <p className="text-xs text-slate-500 mt-1">{selected._id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-sm">
                Close
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <p>Status: <strong>{selected.status}</strong></p>
              <p>Escrow: <strong>{selected.escrowStatus}</strong></p>
              <p>Amount: NPR {selected.amount.toLocaleString()}</p>
              <p>When: {new Date(selected.scheduledAt).toLocaleString()}</p>
              <p>Address: {selected.address}</p>
              {selected.notes && <p>Notes: {selected.notes}</p>}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {actionsFor(selected).map((action) => (
                <button
                  key={action}
                  disabled={acting}
                  onClick={() => runAction(selected, action)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${
                    action === 'cancel' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {action}
                </button>
              ))}
            </div>

            {!isPro && selected.status === 'completed' && !reviewDone[selected._id] && (
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Leave a review</h3>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the service?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
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
    </div>
  );
}
