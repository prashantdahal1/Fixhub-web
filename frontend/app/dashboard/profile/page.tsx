"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Pencil, Mail, Phone, MapPin, Briefcase, User, Globe, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  title: string;
  country: string;
  cityState: string;
}

const ProfilePage: React.FC = () => {
  const { user, fetchUser } = useAuth();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    title: 'Customer',
    country: '',
    cityState: '',
  });

  const [tempProfile, setTempProfile] = useState<ProfileData>(profile);

  // Sync with auth user data
  useEffect(() => {
    if (user) {
      const initialProfile = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        bio: user.bio || '',
        title: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer',
        country: user.country || '',
        cityState: user.cityState || '',
      };
      setProfile(initialProfile);
      setTempProfile(initialProfile);
    }
  }, [user]);

  const handleSave = async (section: 'profile' | 'personal' | 'address') => {
    // Build update payload based on what the backend user model supports
    const formData = new FormData();
    formData.append('firstName', tempProfile.firstName);
    formData.append('lastName', tempProfile.lastName);
    formData.append('email', tempProfile.email);
    formData.append('phoneNumber', tempProfile.phone);
    formData.append('bio', tempProfile.bio);
    formData.append('country', tempProfile.country);
    formData.append('cityState', tempProfile.cityState);

    try {
      const res = await fetch('/api/v1/auth/update', {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        setProfile(tempProfile);
        toast.success('Profile information updated successfully.');
        await fetchUser();
        
        if (section === 'profile') setIsEditingProfile(false);
        if (section === 'personal') setIsEditingPersonal(false);
        if (section === 'address') setIsEditingAddress(false);
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to update profile.');
      }
    } catch (err) {
      toast.error('An error occurred. Backend is unreachable.');
    }
  };

  const handleCancel = (section: 'profile' | 'personal' | 'address') => {
    setTempProfile(profile);
    if (section === 'profile') setIsEditingProfile(false);
    if (section === 'personal') setIsEditingPersonal(false);
    if (section === 'address') setIsEditingAddress(false);
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setTempProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await fetch('/api/v1/auth/upload', {
          method: 'PUT',
          body: formData,
        });

        if (res.ok) {
          toast.success('Profile picture uploaded successfully.');
          await fetchUser();
        } else {
          const errData = await res.json();
          toast.error(errData.message || 'Failed to upload profile picture.');
        }
      } catch (err) {
        toast.error('Error uploading image. Backend is unreachable.');
      }
    }
  };

  // Get display initials
  const initials = `${profile.firstName.charAt(0) || 'P'}${profile.lastName.charAt(0) || 'S'}`.toUpperCase();
  const avatarUrl = user?.profilePicture;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: '#070B14' }}>
            My Profile
          </h1>
        </div>

        {/* Profile Header Card */}
        <div
          className="rounded-2xl p-6 mb-6 flex items-center justify-between"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" 
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                  }}
                >
                  {initials}
                </div>
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera size={18} className="text-white" />
              </div>
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#070B14' }}>
                {profile.firstName || 'User'} {profile.lastName}
              </h2>
              <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: '#64748B' }}>
                <Briefcase size={14} style={{ color: '#1565C0' }} />
                {profile.title}
              </p>
              {(profile.cityState || profile.country) && (
                <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: '#64748B' }}>
                  <MapPin size={14} style={{ color: '#1565C0' }} />
                  {profile.cityState}{profile.country ? `, ${profile.country}` : ''}
                </p>
              )}
            </div>
          </div>

          {!isEditingProfile ? (
            <button
              onClick={() => {
                setTempProfile(profile);
                setIsEditingProfile(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1565C0',
                border: '1px solid #1565C0',
              }}
            >
              <Pencil size={14} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSave('profile')}
                className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200 hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)' }}
              >
                Save
              </button>
              <button
                onClick={() => handleCancel('profile')}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{ color: '#64748B', border: '1px solid #E2E8F0' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Personal Information Card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold" style={{ color: '#070B14' }}>
              Personal information
            </h3>
            {!isEditingPersonal ? (
              <button
                onClick={() => {
                  setTempProfile(profile);
                  setIsEditingPersonal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1565C0',
                  border: '1px solid #1565C0',
                }}
              >
                <Pencil size={14} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave('personal')}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200 hover:shadow-md"
                  style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => handleCancel('personal')}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={{ color: '#64748B', border: '1px solid #E2E8F0' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
                <User size={12} className="inline mr-1" />
                First Name
              </label>
              {isEditingPersonal ? (
                <input
                  type="text"
                  value={tempProfile.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: '1px solid #60AAFF',
                    color: '#070B14',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#070B14' }}>
                  {profile.firstName || '—'}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
                <User size={12} className="inline mr-1" />
                Last Name
              </label>
              {isEditingPersonal ? (
                <input
                  type="text"
                  value={tempProfile.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: '1px solid #60AAFF',
                    color: '#070B14',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#070B14' }}>
                  {profile.lastName || '—'}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
                <Mail size={12} className="inline mr-1" />
                Email address
              </label>
              {isEditingPersonal ? (
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: '1px solid #60AAFF',
                    color: '#070B14',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#070B14' }}>
                  {profile.email || '—'}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
                <Phone size={12} className="inline mr-1" />
                Phone
              </label>
              {isEditingPersonal ? (
                <input
                  type="text"
                  value={tempProfile.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: '1px solid #60AAFF',
                    color: '#070B14',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#070B14' }}>
                  {profile.phone || '—'}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
                <Briefcase size={12} className="inline mr-1" />
                Bio
              </label>
              {isEditingPersonal ? (
                <textarea
                  value={tempProfile.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all resize-none"
                  style={{
                    border: '1px solid #60AAFF',
                    color: '#070B14',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#070B14' }}>
                  {profile.bio || '—'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold" style={{ color: '#070B14' }}>
              Address
            </h3>
            {!isEditingAddress ? (
              <button
                onClick={() => {
                  setTempProfile(profile);
                  setIsEditingAddress(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1565C0',
                  border: '1px solid #1565C0',
                }}
              >
                <Pencil size={14} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave('address')}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200 hover:shadow-md"
                  style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => handleCancel('address')}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={{ color: '#64748B', border: '1px solid #E2E8F0' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
                <Globe size={12} className="inline mr-1" />
                Country
              </label>
              {isEditingAddress ? (
                <input
                  type="text"
                  value={tempProfile.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: '1px solid #60AAFF',
                    color: '#070B14',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#070B14' }}>
                  {profile.country || '—'}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>
                <MapPin size={12} className="inline mr-1" />
                City / State
              </label>
              {isEditingAddress ? (
                <input
                  type="text"
                  value={tempProfile.cityState}
                  onChange={(e) => updateField('cityState', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: '1px solid #60AAFF',
                    color: '#070B14',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#070B14' }}>
                  {profile.cityState || '—'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
