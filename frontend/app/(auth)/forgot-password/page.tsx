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
      const res = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast.success('Reset link sent! Check your email (or backend console for the preview link).');
      } else {
        toast.error(data.message || 'Something went wrong.');
      }
    } catch {
      toast.error('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[420px] bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
          {/* Left Split Panel - Blue with Branding & Image */}
          <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-6 md:p-8 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Faint Architectural Topography Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="topo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0 50 Q 25 40, 50 50 T 100 50" stroke="#94a3b8" strokeWidth="1" fill="none" />
                  <path d="M0 30 Q 25 20, 50 30 T 100 30" stroke="#94a3b8" strokeWidth="1" fill="none" />
                  <path d="M0 70 Q 25 60, 50 70 T 100 70" stroke="#94a3b8" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo)" />
            </svg>

            {/* Premium Radial Glow Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#38BDF8] opacity-[0.12] blur-[80px] pointer-events-none" />

            {/* Image & Branding */}
            <div className="flex flex-col items-center justify-center text-center relative z-2 space-y--0">
              <div className="relative w-80 h-90 md:w-120 md:h-60">
                <Image
                  src="/images/password.png"
                  alt="Password recovery illustration"
                  fill
                  sizes="(max-width: 768px) 290px, 300px"
                  className="object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)]"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Reset Your Password</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  Seamlessly recover your password by sending the link to your email.
                </p>
              </div>
            </div>
          </div>

          {/* Right Split Panel - White with Form */}
          <div className="bg-white px-10 md:px-14 pb-12 flex flex-col justify-center">
            {/* Centered Form Container */}
            <div className="w-full max-w-sm mx-auto my-auto">
              {/* Logo */}
              <div className="mb-3">
                <Image
                  src="/fixhub.png"
                  alt="FixHub Logo"
                  width={90}
                  height={90}
                />
              </div>

              {sent ? (
                /* Success State */
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-[#0F172A] mb-2">Check Your Email!</h1>
                  <p className="text-slate-500 text-sm mb-2">
                    We've sent a reset link to <strong>{email}</strong>.
                  </p>
                  <p className="text-slate-400 text-xs mb-5">
                    The link expires in 15 minutes. Check your backend console for a preview URL if using dev mode.
                  </p>
                  <Link href="/login" className="text-sm font-semibold text-[#2D6FFF] hover:underline">
                    Back to Login
                  </Link>
                </div>
              ) : (
                <>
                  {/* Headings */}
                  <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Forgot Your Password?</h1>
                  <p className="text-slate-500 text-sm mb-4">No problem. Enter your email and we'll send you a reset link.</p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Email */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="youremail@gmail.com"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent placeholder:text-slate-400"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#2D6FFF] hover:bg-[#1E56DB] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : 'Send Reset Link'}
                    </button>
                  </form>

                  {/* Back to Login Link */}
                  <Link href="/login" className="text-sm font-semibold text-[#2D6FFF] hover:underline transition-all mt-4 block text-center">
                    Back to Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
