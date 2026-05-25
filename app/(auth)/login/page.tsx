'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function LoginPage() {
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { userType, ...formData });
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
                  src="/images/login mobile.png"
                  alt="Login"
                  fill
                  sizes="(max-width: 768px) 288px, 384px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Branding Text */}
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Instant Home Solutions</h2>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                Book verified home professionals in minutes. Fast, safe, and trusted across the homestead.
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
            <h1 className="text-3xl font-bold text-[#0F172A] mb-6">Welcome back!</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] mb-2 block">EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="youremail@gmail.com"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-[#0F172A] mb-2 block">PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-6"
              >
                Login
              </button>
            </form>

            {/* Signup Link */}
            <div className="text-center mt-6 text-sm">
              <span className="text-slate-600">New to the platform? </span>
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

