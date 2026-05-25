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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left Side - Branding & Image Space */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 md:p-12 flex flex-col justify-between min-h-96 md:min-h-auto">
            {/* Image */}
            <div className="flex-1 flex items-center justify-center mb-8">
              <div className="relative w-56 h-64 md:w-80 md:h-96">
                <Image
                  src="/images/signup verified.png"
                  alt="Signup"
                  fill
                  sizes="(max-width: 768px) 224px, 320px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Branding Text */}
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Verified Professionals</h2>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                Every FixHub is screened and verified. High-quality service for your home.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 md:p-12">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <Image
                src="/fixhub.png"
                alt="FixHub Logo"
                width={48}
                height={48}
              />
              <span className="font-bold text-gray-900 text-xl">FixHub</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 mb-6">Join FixHub and get started today</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Toggle */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">I AM A</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('customer')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      userType === 'customer'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('professional')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      userType === 'professional'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Professional
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">FULL NAME</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="youremail@gmail.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a strong password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-1 rounded border-gray-300"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-6"
              >
                Create Account
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <span className="text-gray-600">Already have an account? </span>
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

