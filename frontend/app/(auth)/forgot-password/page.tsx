'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast.success('Reset link sent! Check your email inbox.');
      } else {
        toast.error(data.message || 'Something went wrong.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col justify-center items-center p-4">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
        style={{ minHeight: '460px' }}
      >

        {/* ── LEFT PANEL — Blue gradient (matches login) ── */}
        <div
          className="relative md:w-[42%] flex-shrink-0 flex flex-col justify-end items-center overflow-hidden py-6"
          style={{
            background: 'linear-gradient(145deg, #3B82F6 0%, #1D4ED8 45%, #1E3A8A 100%)',
          }}
        >
          {/* Radial glows */}
          <div
            className="absolute top-1/4 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-1/3 left-0 w-48 h-48 rounded-full pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, #93C5FD 0%, transparent 70%)' }}
          />

          {/* Password illustration */}
          <div className="relative z-10 w-full flex justify-center pt-4 px-4 flex-1 items-center">
            <Image
              src="/images/password.png"
              alt="Password Recovery"
              width={200}
              height={200}
              loading="eager"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
              style={{ width: 'auto', height: 'auto', maxHeight: '220px' }}
            />
          </div>

          {/* Text & trust badge */}
          <div className="relative z-10 text-center px-6 pt-2 pb-2">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-2.5 py-0.5 mb-2 border border-white/10">
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[9px] text-white font-bold tracking-wider uppercase">Secure Password Reset</span>
            </div>
            <h2 className="text-white text-lg font-bold mb-1">Forgot Your Password?</h2>
            <p className="text-blue-100 text-[11px] leading-relaxed max-w-[220px] mx-auto">
              We'll send a secure reset link straight to your inbox.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — White form ── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-8">

          {/* Logo */}
          <div className="mb-5">
            <Image
              src="/images/fixhub.png"
              alt="FixHub Logo"
              width={100}
              height={32}
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </div>

          {sent ? (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Check Your Email!</h1>
              <p className="text-slate-500 text-sm mb-2">
                We've sent a reset link to <strong className="text-slate-800">{email}</strong>.
              </p>
              <p className="text-slate-400 text-xs mb-6">
                The link expires in 15 minutes. Didn't receive it? Check your spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h1>
              <p className="text-slate-500 text-xs mb-6">
                Enter your email address and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@gmail.com"
                    className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm mt-1 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending Reset Link…
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <Link
                href="/login"
                className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
