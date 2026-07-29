'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

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
  const { fetchUser } = useAuth();

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
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password, userType, stayLoggedIn }),
      });
      const data = await response.json();
      if (!response.ok) { 
        setError(data.message || 'Login failed'); 
        toast.error(data.message || 'Login failed. Please check your credentials.');
        return; 
      }
      
      const loggedInUser = data.data?.user;
      const token = data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (loggedInUser && loggedInUser.role !== userType) {
        // Mismatch! Logout immediately to clear cookie
        localStorage.removeItem('token');
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        const errMsg = `This account is registered as a ${loggedInUser.role}. Please log in using the correct toggle above.`;
        setError(errMsg);
        toast.error(errMsg);
        return;
      }

      toast.success('Login successful! Welcome to FixHub.');
      // Register service worker and show notification if permission granted
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          if (Notification.permission === 'granted') {
            registration.showNotification('Login successful', {
              body: 'Welcome to FixHub',
              icon: '/images/fixhub.png',
            });
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              registration.showNotification('Login successful', {
                body: 'Welcome to FixHub',
                icon: '/images/fixhub.png',
              });
            }
          }
        } catch (e) {
          console.error('Service worker registration failed:', e);
        }
      }
      await fetchUser();
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Backend server is unreachable.');
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

        {/* ── LEFT PANEL — White form ── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-8">

          <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome back !</h1>
          <p className="text-slate-500 text-xs mb-6">Enter your details to access your account</p>

          {/* Customer / Professional toggle */}
          <div className="relative grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 w-full">
            {/* Sliding pill */}
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
            <div className="mb-4 px-3.5 py-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-rose-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="youremail@gmail.com"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
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
                  className="w-full px-4 py-2.5 pr-10 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
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
              <label htmlFor="stayLoggedIn" className="text-xs font-medium text-slate-500 cursor-pointer select-none">
                Stay logged in for 30 days
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm mt-1 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </form>

          {/* Social login partition */}
          <div className="relative flex py-3 items-center mt-4">
            <div className="flex-grow border-t border-slate-150"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">or login with</span>
            <div className="flex-grow border-t border-slate-150"></div>
          </div>

          <div className="grid grid-cols-1">
            <button 
              type="button" 
              onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
              className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-350 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-xs text-slate-500 mt-6">
            New to the platform?{' '}
            <Link href="/register" className="text-blue-650 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* ── RIGHT PANEL — Blue with 3D phone mockup ── */}
        <div
          className="relative md:w-[42%] flex-shrink-0 flex flex-col justify-end items-center overflow-hidden py-6"
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
          <div className="relative z-10 w-full flex justify-center pt-4 px-4">
            <Image
              src="/images/login mobile.png"
              alt="FixHub App"
              width={210}
              height={210}
              loading="eager"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          {/* Trust Badge & Copy */}
          <div className="relative z-10 text-center px-6 pt-4">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-2.5 py-0.5 mb-2 border border-white/10">
              <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708-.523H4.5a2 2 0 00-2 2v1.07a.75.75 0 00.17.478l1.41 1.761a.75.75 0 01.17.478v2.32a.75.75 0 01-.17.478l-1.41 1.762a.75.75 0 00-.17.478v1.07a2 2 0 002 2h1.059a.75.75 0 00.708-.523l1.56-4.679a.75.75 0 01.708-.523h3.768a.75.75 0 01.708.523l1.56 4.679a.75.75 0 00.708.523H15.5a2 2 0 002-2v-1.07a.75.75 0 00-.17-.478l-1.41-1.762a.75.75 0 01-.17-.478v-2.32a.75.75 0 01.17-.478l1.41-1.76a.75.75 0 00.17-.479V4.932a2 2 0 00-2-2h-1.059a.75.75 0 00-.708.523l-1.56 4.679a.75.75 0 01-.708.523H8.535a.75.75 0 01-.708-.523L6.267 3.455z" clipRule="evenodd" />
              </svg>
              <span className="text-[9px] text-white font-bold tracking-wider uppercase">100% Verified Pros</span>
            </div>
            <h2 className="text-white text-lg font-bold mb-1">Instant Home Solutions</h2>
            <p className="text-blue-100 text-[11px] leading-relaxed max-w-[220px] mx-auto">
              Book home services in minutes. Fast, secure, and trusted across Kathmandu.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
