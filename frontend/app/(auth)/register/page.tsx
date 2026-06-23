'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateUserDTO } from "../../../lib/dtos/user.dto";
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [userType, setUserType] = useState('customer');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      setTermsAccepted(checked);
      setError('');
    } else {
      setFormData({ ...formData, [name]: value });
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) { 
      setError('You must accept the terms and conditions'); 
      toast.warn('Please accept the terms and conditions to proceed.');
      return; 
    }
    if (formData.password !== formData.confirmPassword) { 
      setError('Passwords do not match'); 
      toast.error('Passwords do not match.');
      return; 
    }
    const [firstName = '', ...lastNameParts] = formData.fullName.trim().split(' ');
    const payload = {
      firstName,
      lastName: lastNameParts.join(' '),
      email: formData.email,
      phone: formData.phone,
      username: formData.email,
      password: formData.password,
    };
    const result = CreateUserDTO.safeParse(payload);
    if (!result.success) {
      const errMsg = result.error.errors.map(e => e.message).join(', ');
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();
      if (!response.ok) { 
        setError(data.message || 'Registration failed'); 
        toast.error(data.message || 'Registration failed.');
        return; 
      }
      toast.success('Registration successful! Please login to continue.');
      router.push('/login');
    } catch {
      setError('Network error');
      toast.error('Network error. Unable to contact backend.');
    }
  };

  // Eye icon for password toggle
  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row" style={{ minHeight: '560px' }}>

        {/* ── LEFT PANEL — Dark navy with 3D image ── */}
        <div
          className="relative md:w-[44%] flex-shrink-0 flex flex-col justify-end items-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1A56DB 0%, #1E40AF 40%, #0F172A 100%)' }}
        >
          {/* Subtle radial highlight top-left */}
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)' }} />

          {/* 3D technician card image — update path */}
          <div className="relative z-10 w-full flex justify-center pt-10 px-6">
            {/* // Update image path: replace src with your actual 3D card image */}
            <Image
              src="/images/signup_verified.png" // UPDATE YOUR IMAGE PATH HERE
              alt="Verified Technician"
              width={260}
              height={260}
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Bottom text */}
          <div className="relative z-10 text-center px-8 pb-10 pt-4">
            <h2 className="text-white text-2xl font-bold mb-2">Verified Professionals</h2>
            <p className="text-blue-200 text-xs leading-relaxed max-w-[220px] mx-auto">
              Every technician is screened and verified to deliver reliable, high-quality service for your home.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — White form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">

          {/* Logo — update path */}
          <div className="mb-5">
            {/* // UPDATE YOUR LOGO PATH HERE */}
            <Image
              src="/fixhub.png" // UPDATE YOUR LOGO PATH HERE
              alt="FixHub"
              width={110}
              height={36}
              className="object-contain"
            />
          </div>

          {/* Customer / Professional toggle */}
          <div className="relative grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 w-full">
            {/* Sliding pill */}
            <div
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-200 ease-in-out ${userType === 'professional' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'}`}
            />
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`relative z-10 py-2 text-sm font-medium rounded-lg transition-colors ${userType === 'customer' ? 'text-slate-900' : 'text-slate-400'}`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType('professional')}
              className={`relative z-10 py-2 text-sm font-medium rounded-lg transition-colors ${userType === 'professional' ? 'text-slate-900' : 'text-slate-400'}`}
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

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                required
              />
            </div>

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
                placeholder="yourmail@gmail.com"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                required
              />
            </div>

            {/* Password + Confirm — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-2.5 pr-10 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-2.5 pr-10 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555 123 4567"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" required
                required
              />
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer select-none">
                I agree to the{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-1"
            >
              Create Account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-xs text-slate-500 mt-4">
            Already part of the network?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Login to FixHub
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
