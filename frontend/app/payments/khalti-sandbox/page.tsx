'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function KhaltiSandboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const intentId = searchParams.get('intentId') || '';
  const purchaseOrderId = searchParams.get('purchaseOrderId') || '';
  const amount = Number(searchParams.get('amount') || 0) / 100;

  const isReady = useMemo(() => Boolean(intentId && purchaseOrderId && amount > 0), [intentId, purchaseOrderId, amount]);

  const completePayment = () => {
    if (!isReady) return;

    const callbackUrl = new URL('/api/v1/bookings/verify/khalti', window.location.origin);
    callbackUrl.searchParams.set('pidx', `mock_khalti_${intentId}_${Date.now()}`);
    callbackUrl.searchParams.set('status', 'Completed');
    callbackUrl.searchParams.set('purchase_order_id', purchaseOrderId);
    callbackUrl.searchParams.set('transaction_id', `mock_tx_${Date.now()}`);
    callbackUrl.searchParams.set('amount', String(Math.round(amount * 100)));
    window.location.href = callbackUrl.toString();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-600">Khalti Sandbox</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Manual payment confirmation</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page is a local development sandbox. Nothing is booked until you explicitly click Complete Payment.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p><span className="font-semibold text-slate-900">Intent:</span> {intentId || 'Missing'}</p>
          <p><span className="font-semibold text-slate-900">Purchase order:</span> {purchaseOrderId || 'Missing'}</p>
          <p><span className="font-semibold text-slate-900">Amount:</span> NPR {amount.toLocaleString()}</p>
        </div>

        {!isReady && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Missing payment context. Go back and start the booking again.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!isReady}
            onClick={completePayment}
            className="rounded-xl bg-[#5C2D91] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-[#4a2275] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Complete Payment
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/bookings?payment=cancelled')}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}