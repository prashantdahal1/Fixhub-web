'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function RegisterPage() {
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup:', { userType, ...formData });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left Split Panel - Blue with Branding & Image */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 md:p-12 flex flex-col justify-between">
            {/* Image */}
            <div className="flex-1 flex items-center justify-center mb-8">
              <div className="relative w-72 h-80 md:w-96 md:h-[28rem]">
                <Image
                  src="/images/signup verified.png"
                  alt="Signup"
                  fill
                  sizes="(max-width: 768px) 288px, 384px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Branding Text */}
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Verified Professionals</h2>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                Every FixHub is screened and verified. High-quality service for your home.
              </p>
            </div>
          </div>

          {/* Right Split Panel - White with Form */}
          <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/fixhub.png"
                alt="FixHub Logo"
                width={120}
                height={120}
              />
            </div>

            {/* Headings */}
            <h1 className="text-3xl font-bold text-[#0F172A] mb-6">Create Account</h1>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* User Type Toggle - Light Segmented Container */}
              <div className="bg-slate-100 p-1 rounded-lg flex gap-1 mb-6">
                <button
                  type="button"
                  onClick={() => setUserType('customer')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
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
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    userType === 'professional'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Professional
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] mb-1.5 block">FULL NAME</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] mb-1.5 block">EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="youremail@gmail.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] mb-1.5 block">PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a strong password"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] mb-1.5 block">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-0.5 rounded border-slate-300"
                  required
                />
                <label htmlFor="terms" className="text-xs text-slate-600">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-4"
              >
                Create Account
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-4 text-sm">
              <span className="text-slate-600">Already part of the platform? </span>
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

