'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api/client';
import { API } from '../../../lib/api/endpoints';
import { downloadReceiptPdf, downloadJobsReportPdf, JobReportEntry } from '../../../lib/receipt-pdf';
import { Search, Download, FileText, CheckCircle2, Clock, XCircle, ChevronRight, Briefcase } from 'lucide-react';

type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

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
  return booking._id.slice(-8).toUpperCase();
}

type TabType = 'all' | 'completed' | 'confirmed' | 'in_progress' | 'cancelled';

export default function HistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BookingDoc | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isPro = user?.role === 'professional';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bookingRes = await apiFetch<{ data: BookingDoc[] }>(API.BOOKINGS.LIST);
      setBookings(bookingRes.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load service history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stepIndex = (status: BookingStatus) => {
    if (status === 'cancelled') return -1;
    return STEPS.indexOf(status);
  };

  const downloadReceipt = (booking: BookingDoc) => {
    const cust = booking.customerId;
    downloadReceiptPdf({
      orderNumber: orderNumber(booking),
      orderId: booking._id,
      invoiceNumber: `INV-${orderNumber(booking)}`,
      service: serviceTitle(booking.serviceId),
      status: booking.status,
      escrowStatus: booking.escrowStatus,
      amount: booking.amount,
      scheduledAt: booking.scheduledAt,
      address: booking.address,
      customer: personName(cust),
      customerEmail: cust && typeof cust === 'object' ? (cust as any).email : undefined,
      customerPhone: cust && typeof cust === 'object' ? (cust as any).phoneNumber : undefined,
      professional: personName(booking.professionalId),
      notes: booking.notes,
    });
    toast.success('Downloading PDF Receipt/Invoice...');
  };

  const downloadJobsReport = () => {
    const proName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User' : 'User';
    const entries: JobReportEntry[] = filteredBookings.map(b => ({
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
    toast.success('Downloading Summary PDF Report...');
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
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header matching Active Bookings UI */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isPro ? 'Job History Logs' : 'Service History'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isPro
              ? 'View all your completed job records, payment statuses, and download PDF summaries.'
              : 'Review your past service orders, download invoices/receipts, and track completed tasks.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={downloadJobsReport}
            disabled={filteredBookings.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors disabled:opacity-40 shadow-sm"
          >
            <Download className="h-4 w-4 text-blue-600" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 overflow-x-auto">
          {(
            [
              { id: 'all',         label: 'All',         count: bookings.length },
              { id: 'completed',   label: 'Completed',   count: bookings.filter(b => b.status === 'completed').length },
              { id: 'confirmed',   label: 'Confirmed',   count: bookings.filter(b => b.status === 'confirmed').length },
              { id: 'in_progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in_progress').length },
              { id: 'cancelled',   label: 'Cancelled',   count: bookings.filter(b => b.status === 'cancelled').length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`rounded-lg px-3 py-1.5 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking, party, address..."
            className="w-full rounded-xl border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-4">Loading history records...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No service history records found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? "Try resetting your search query." : "Your completed and past service records will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const si = stepIndex(b.status);
            return (
              <button
                key={b._id}
                type="button"
                onClick={() => setSelected(b)}
                className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        {serviceTitle(b.serviceId)}
                      </p>
                      <span className="font-mono text-[10px] text-slate-400">#{orderNumber(b)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 inline" />
                        {new Date(b.scheduledAt).toLocaleString()}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                        {b.address}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {isPro ? `Customer: ${personName(b.customerId)}` : `Pro: ${personName(b.professionalId)}`}
                      {' · '}<strong className="text-slate-900">NPR {b.amount.toLocaleString()}</strong> · escrow: <span className="capitalize">{b.escrowStatus}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[b.status]}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadReceipt(b);
                      }}
                      className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Download className="h-3 w-3 inline" /> Download Invoice
                    </button>
                  </div>
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

      {/* Side Slide-out Modal for Booking Detail */}
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
              <button
                type="button"
                onClick={() => downloadReceipt(selected)}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors w-full justify-center"
              >
                <Download className="h-4 w-4" />
                Download PDF Invoice / Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
