'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginUserDTO } from "../../../shared/dtos/user.dto";
import { z } from "zod";

export default function LoginPage() {
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate using Zod schema
    const result = LoginUserDTO.safeParse(formData);
    if (!result.success) {
      setError(z.prettifyError(result.error));
      return;
    }
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      // On success, redirect to dashboard or home
      router.push('/');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[520px] bg-white rounded-3xl shadow-xl overflow-hidden">
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
            <div className="flex flex-col items-center justify-center text-center relative z-10">
              <div className="relative w-60 h-72 md:w-72 md:h-80 mb-6">
                <Image
                  src="/images/login mobile.png"
                  alt="Login"
                  fill
                  sizes="(max-width: 768px) 240px, 288px"
                  className="object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)]"
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">Instant Home Solutions</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                  Find trusted professionals instantly
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
            <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-1">Welcome back!</h1>

            <p className="text-slate-500 text-xs mb-3">Login to your account</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* User Type Toggle - Light Segmented Container */}
              <div className="bg-slate-100 p-0.5 rounded-lg flex gap-0.5 mb-4">
                <button
                  type="button"
                  onClick={() => setUserType('customer')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                    userType === 'customer'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('professional')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                    userType === 'professional'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Professional
                </button>
              </div>

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

              {/* Password with Forgot Password Link */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Password</label>
                  <Link href="/forgot-password" className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold">
                    Forgot Passowrd?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors mt-4 text-sm"
              >
                Login
              </button>
            </form>

                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium">{error}</p>
                  </div>
                )}
            {/* Signup Link */}
            <div className="text-center mt-2.5 text-xs">
              <span className="text-slate-600">New? </span>
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

