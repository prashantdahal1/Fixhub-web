'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

import { toast } from 'react-toastify';

export default function LoginPage() {
  const [userType, setUserType] = useState<'customer' | 'professional'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, userType }),
      });
      const data = await response.json();
      if (!response.ok) { 
        setError(data.message || 'Login failed'); 
        toast.error(data.message || 'Login failed. Please check your credentials.');
        return; 
      }
      toast.success('Login successful! Welcome to FixHub.');
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Backend server is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ minHeight: '520px' }}
      >

        {/* ── LEFT PANEL — White form ── */}
        <div className="flex-1 flex flex-col justify-center px-10 md:px-14 py-10">

          {/* Logo — UPDATE YOUR LOGO PATH HERE */}
          <div className="mb-6">
            <Image
              src="/fixhub.png"
              alt="FixHub"
              width={110}
              height={36}
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-5">Welcome back !</h1>

          {/* Customer / Professional toggle */}
          <div className="relative grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
            <div
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-200 ease-in-out ${
                userType === 'professional' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'
              }`}
            />
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`relative z-10 py-2 text-sm font-medium rounded-lg transition-colors ${
                userType === 'customer' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType('professional')}
              className={`relative z-10 py-2 text-sm font-medium rounded-lg transition-colors ${
                userType === 'professional' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Professional
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="youremail@gmail.com"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Stay logged in */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="stayLoggedIn"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="stayLoggedIn" className="text-xs text-slate-500 cursor-pointer select-none">
                Stay logged in for 30 days
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-1"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-5 space-y-3">
            <p className="text-center text-xs text-slate-400">New to the platform?</p>
            <Link
              href="/register"
              className="block w-full text-center border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 font-medium py-2.5 rounded-xl text-sm transition-all"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* ── RIGHT PANEL — Blue with 3D phone mockup ── */}
        <div
          className="relative md:w-[45%] flex-shrink-0 flex flex-col justify-end items-center overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #3B82F6 0%, #1D4ED8 45%, #1E3A8A 100%)',
          }}
        >
          {/* Radial glows */}
          <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/3 left-0 w-48 h-48 rounded-full pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, #93C5FD 0%, transparent 70%)' }} />

          {/* 3D phone mockup image */}
          <div className="relative z-10 w-full flex justify-center pt-8 px-4">
            {/* 3D phone image — UPDATE YOUR IMAGE PATH HERE */}
            <Image
              src="/images/login_phone_mockup.png"
              alt="FixHub App"
              width={300}
              height={300}
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* Bottom text */}
          <div className="relative z-10 text-center px-8 pb-10 pt-4">
            <h2 className="text-white text-2xl font-bold mb-2">Instant Home Solutions</h2>
            <p className="text-blue-200 text-xs leading-relaxed max-w-[240px] mx-auto">
              Book verified home service professionals in minutes. Fast, secure, and trusted across Kathmandu.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
