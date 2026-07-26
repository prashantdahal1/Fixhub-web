"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, Lock, DollarSign, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { apiFetch } from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

interface WalletData {
  balance: number;
  held: number;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, held: 0 });
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: { wallet: WalletData } }>(API.WALLET.GET);
      if (res.data?.wallet) {
        setWallet(res.data.wallet);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load wallet balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadWallet();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amt > wallet.balance) {
      toast.error("Insufficient available balance");
      return;
    }

    setWithdrawing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success(`Payout request of Rs ${amt.toLocaleString()} submitted successfully!`);
      setWithdrawModal(false);
      setWithdrawAmount("");
      loadWallet();
    } catch (err: any) {
      toast.error(err.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  const isPro = user?.role === "professional";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isPro ? "Earnings & Wallet" : "My Wallet"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isPro
              ? "Manage your service payouts, earnings history, and escrow balances."
              : "Track your payments, escrow deposits, and transaction history."}
          </p>
        </div>
        <button
          onClick={loadWallet}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">
              {isPro ? "Available Payout" : "Available Balance"}
            </span>
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">
            Rs {wallet.balance.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-blue-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              Ready to withdraw
            </span>
            {isPro && (
              <button
                onClick={() => setWithdrawModal(true)}
                className="bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow"
              >
                Withdraw Funds
              </button>
            )}
          </div>
        </div>

        {/* Escrow Balance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Escrow Held
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Rs {wallet.held.toLocaleString()}
          </p>
          <p className="mt-4 text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Released automatically upon job completion
          </p>
        </div>

        {/* Total Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Volume
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Rs {(wallet.balance + wallet.held).toLocaleString()}
          </p>
          <p className="mt-4 text-[11px] text-slate-500">
            Combined available & held funds
          </p>
        </div>
      </div>

      {/* Payout & Escrow Info Box */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-2">How Escrow & Payouts Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <p>Customer books service & funds are safely deposited into Escrow.</p>
          </div>
          <div className="flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <p>Pro completes service work and marks the booking complete.</p>
          </div>
          <div className="flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <p>Escrow unlocks into Available Payout balance for instant withdrawal.</p>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Withdraw Earnings</h3>
              <button
                onClick={() => setWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Withdrawal Amount (Rs)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  max={wallet.balance}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Max available: Rs {wallet.balance.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow disabled:opacity-50"
                >
                  {withdrawing ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
