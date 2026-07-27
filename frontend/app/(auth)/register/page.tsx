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
    phone: '+977 ',
    password: '',
    confirmPassword: '',
    verificationDocument: null as File | null
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      setTermsAccepted(checked);
      setError('');
    } else if (name === 'phone') {
      // Force it to always start with '+977 '
      if (!value.startsWith('+977 ')) {
        // If they try to backspace into the prefix, keep '+977 '
        setFormData({ ...formData, phone: '+977 ' });
      } else {
        setFormData({ ...formData, phone: value });
      }
      setError('');
    } else if (type === 'file') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.files ? target.files[0] : null });
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
      role: userType,
    };
    const result = CreateUserDTO.safeParse(payload);
    if (!result.success) {
      const errMsg = result.error.issues.map((e) => e.message).join(', ');
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    try {
      const submitData = new FormData();
      Object.entries(result.data).forEach(([key, value]) => {
        submitData.append(key, value as string);
      });

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        body: submitData,
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
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row" style={{ minHeight: '520px' }}>

        {/* ── LEFT PANEL — Blue with 3D image ── */}
        <div
          className="relative md:w-[42%] flex-shrink-0 flex flex-col justify-end items-center overflow-hidden py-8"
          style={{ background: 'linear-gradient(145deg, #3B82F6 0%, #1D4ED8 45%, #1E3A8A 100%)' }}
        >
          {/* Subtle radial highlight top-left */}
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)' }} />

          {/* 3D technician card image */}
          <div className="relative z-10 w-full flex justify-center pt-8 px-4">
            <Image
              src="/images/signup_verified.png"
              alt="Verified Technician"
              width={230}
              height={230}
              loading="eager"
              className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)]"
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          {/* Bottom text */}
          <div className="relative z-10 text-center px-6 pb-8 pt-4">
            <h2 className="text-white text-xl font-bold mb-2">Verified Professionals</h2>
            <p className="text-blue-200 text-[11px] leading-relaxed max-w-[210px] mx-auto">
              Every technician is screened and verified to deliver reliable, high-quality service for your home.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — White form ── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-6">

          {/* Logo — update path */}
          <div className="mb-4">
            <Image
              src="/images/fixhub.png"
              alt="FixHub"
              width={95}
              height={30}
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

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977 9800000000"
                pattern="\+977\s\d{9,10}"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                required
              />
            </div>

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
                placeholder="yourmail@gmail.com"
                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                required
              />
            </div>

            {/* Password + Confirm — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-2.5 pr-10 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-2.5 pr-10 text-sm text-slate-800 border border-slate-200 rounded-xl placeholder:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
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

            {/* Professional License Upload */}
            {userType === 'professional' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Industrial/Business License
                </label>
                <input
                  type="file"
                  name="verificationDocument"
                  onChange={handleChange}
                  accept=".pdf, image/jpeg, image/png, image/webp"
                  className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none hover:border-slate-300 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required={userType === 'professional'}
                />
              </div>
            )}

            {/* Terms */}
            <div className="flex items-center gap-2.5 pt-2">
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
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-2 shadow-sm hover:shadow-md"
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
