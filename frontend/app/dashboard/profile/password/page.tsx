"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';

const UpdatePasswordPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/v1/auth/password', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully.');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        router.push('/dashboard/profile');
      } else {
        toast.error(data.message || 'Failed to update password.');
      }
    } catch (err) {
      toast.error('An error occurred. Backend is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
        {/* Back Link */}
        <button 
          onClick={() => router.push('/dashboard/profile')}
          className="text-sm font-medium mb-6 flex items-center gap-1 hover:underline"
          style={{ color: '#2563EB' }}
        >
          &larr; Back to Profile
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: '#070B14' }}>
            Update Password
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Change your account password securely.
          </p>
        </div>

        {/* Form Card */}
        <form 
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          {/* Old Password */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
              Current Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type={showOldPassword ? 'text' : 'password'}
                name="oldPassword"
                required
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1px solid #E2E8F0',
                  color: '#070B14',
                  backgroundColor: '#F8FAFC',
                }}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <KeyRound size={16} />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1px solid #E2E8F0',
                  color: '#070B14',
                  backgroundColor: '#F8FAFC',
                }}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <KeyRound size={16} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1px solid #E2E8F0',
                  color: '#070B14',
                  backgroundColor: '#F8FAFC',
                }}
                placeholder="Verify new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-md disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
  );
};

export default UpdatePasswordPage;
