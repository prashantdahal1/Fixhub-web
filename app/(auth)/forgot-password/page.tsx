'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset Password Email:', formData);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[420px] bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
          {/* Left Split Panel - Blue with Image Space */}
          <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-6 md:p-8 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Faint Architectural Topography Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="topo-forgot" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0 50 Q 25 40, 50 50 T 100 50" stroke="#94a3b8" strokeWidth="1" fill="none" />
                  <path d="M0 30 Q 25 20, 50 30 T 100 30" stroke="#94a3b8" strokeWidth="1" fill="none" />
                  <path d="M0 70 Q 25 60, 50 70 T 100 70" stroke="#94a3b8" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo-forgot)" />
            </svg>

            {/* Premium Radial Glow Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#38BDF8] opacity-[0.12] blur-[80px] pointer-events-none" />

            {/* Image Placeholder & Branding */}
            <div className="flex flex-col items-center justify-center text-center relative z-10">
              <div className="relative w-40 h-48 md:w-44 md:h-52 mb-3 filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)]">
                <Image
                  src="/images/password.png"
                  alt="Forgot Password"
                  fill
                  sizes="(max-width: 768px) 160px, 176px"
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-1 text-white">Forgot Password</h2>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                  We'll send you a reset link
                </p>
              </div>
            </div>
          </div>

          {/* Right Split Panel - White with Form */}
          <div className="bg-white px-10 md:px-14 pb-12 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-3">
              <Image
                src="/fixhub.png"
                alt="FixHub Logo"
                width={90}
                height={90}
              />
            </div>

            {/* Headings */}
            <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-1">Forgot Password?</h1>
            <p className="text-slate-600 text-xs mb-3">Enter your email for reset link</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="youremail@gmail.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Submit Button */}
              <button className="mb-8"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-3 text-sm"
              >
                Send Reset Link
              </button>
            </form>

            {/* Back to Login Link */}
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-[#2D6FFF] transition-colors mt-6 block text-center">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
