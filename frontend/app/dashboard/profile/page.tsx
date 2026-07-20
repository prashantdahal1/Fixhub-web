"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Pencil, Mail, Phone, MapPin, Briefcase, User, Globe, Camera } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province"
];

const NEPAL_CITIES = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Bharatpur",
  "Biratnagar",
  "Birgunj",
  "Butwal",
  "Dharan",
  "Itahari",
  "Nepalgunj",
  "Dhangadhi",
  "Hetauda",
  "Siddharthanagar (Bhairahawa)"
];

const CITY_TO_PROVINCE_MAP: Record<string, string> = {
  "Kathmandu": "Bagmati Province",
  "Lalitpur": "Bagmati Province",
  "Bhaktapur": "Bagmati Province",
  "Pokhara": "Gandaki Province",
  "Bharatpur": "Bagmati Province",
  "Biratnagar": "Koshi Province",
  "Birgunj": "Madhesh Province",
  "Butwal": "Lumbini Province",
  "Dharan": "Koshi Province",
  "Itahari": "Koshi Province",
  "Nepalgunj": "Lumbini Province",
  "Dhangadhi": "Sudurpashchim Province",
  "Hetauda": "Bagmati Province",
  "Siddharthanagar (Bhairahawa)": "Lumbini Province"
};

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  title: string;
  province: string;
  city: string;
  address: string;
}

const ProfilePage: React.FC = () => {
  const { user, fetchUser } = useAuth();
  const router = useRouter();
  
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
    province: '',
    city: '',
    address: '',
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
        province: (user as any).province || '',
        city: (user as any).city || '',
        address: (user as any).address || '',
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
    formData.append('province', tempProfile.province);
    formData.append('city', tempProfile.city);
    formData.append('address', tempProfile.address);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/v1/auth/update', {
        method: 'PUT',
        headers,
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

  const handleCityChange = (cityValue: string) => {
    const mappedProvince = CITY_TO_PROVINCE_MAP[cityValue];
    setTempProfile((prev) => ({
      ...prev,
      city: cityValue,
      ...(mappedProvince ? { province: mappedProvince } : {})
    }));
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/v1/auth/upload', {
          method: 'PUT',
          headers,
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal information and account settings.</p>
        </div>

        {/* Profile Header Card */}
        <div className="rounded-2xl p-5 mb-5 flex items-center justify-between bg-white border border-gray-200 transition-shadow hover:shadow-sm">
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
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
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
              <h2 className="text-[15px] font-semibold text-slate-900">
                {profile.firstName || 'User'} {profile.lastName}
              </h2>
              <p className="text-sm mt-0.5 flex items-center gap-1.5 text-slate-500">
                <Briefcase size={13} className="text-[#2563EB]" />
                {profile.title}
              </p>
              {(profile.city || profile.province || profile.address) && (
                <p className="text-sm mt-0.5 flex items-center gap-1.5 text-slate-500">
                  <MapPin size={13} className="text-[#2563EB]" />
                  {profile.address ? `${profile.address}, ` : ''}{profile.city}{profile.province ? `, ${profile.province}` : ''}
                </p>
              )}
            </div>
          </div>
          {/* Edit button removed since Personal Information and Address sections have their own edit controls */}
        </div>

        {/* Security Settings & Profile Links */}
        <div className="rounded-2xl p-5 mb-5 flex items-center justify-between bg-white border border-gray-200 transition-shadow hover:shadow-sm">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">Security Credentials</h3>
            <p className="text-sm text-slate-500 mt-0.5">Keep your password updated to stay secure.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/profile/password')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#2563EB] border border-[#2563EB] bg-white hover:bg-blue-50 transition-colors"
          >
            Change Password
          </button>
        </div>

        {/* Personal Information Card */}
        <div className="rounded-2xl p-5 mb-5 bg-white border border-gray-200 transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Personal information</h3>
            {!isEditingPersonal ? (
              <button
                onClick={() => { setTempProfile(profile); setIsEditingPersonal(true); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#2563EB] border border-[#2563EB] bg-white hover:bg-blue-50 transition-colors"
              >
                <Pencil size={13} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleSave('personal')} className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors">
                  Save
                </button>
                <button onClick={() => handleCancel('personal')} className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                <User size={11} />
                First Name
              </label>
              {isEditingPersonal ? (
                <input type="text" value={tempProfile.firstName} onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              ) : (
                <p className="text-sm font-medium text-slate-800">{profile.firstName || '—'}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                <User size={11} />
                Last Name
              </label>
              {isEditingPersonal ? (
                <input type="text" value={tempProfile.lastName} onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              ) : (
                <p className="text-sm font-medium text-slate-800">{profile.lastName || '—'}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                <Mail size={11} />
                Email address
              </label>
              {isEditingPersonal ? (
                <input type="email" value={tempProfile.email} onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              ) : (
                <p className="text-sm font-medium text-slate-800">{profile.email || '—'}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                <Phone size={11} />
                Phone
              </label>
              {isEditingPersonal ? (
                <input type="text" value={tempProfile.phone} onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              ) : (
                <p className="text-sm font-medium text-slate-800">{profile.phone || '—'}</p>
              )}
            </div>

            {user?.role === 'professional' && (
              <div className="col-span-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                  <Briefcase size={11} />
                  Bio
                </label>
                {isEditingPersonal ? (
                  <textarea value={tempProfile.bio} onChange={(e) => updateField('bio', e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{profile.bio || '—'}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Address Card */}
        <div className="rounded-2xl p-5 bg-white border border-gray-200 transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Address</h3>
            {!isEditingAddress ? (
              <button
                onClick={() => { setTempProfile(profile); setIsEditingAddress(true); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#2563EB] border border-[#2563EB] bg-white hover:bg-blue-50 transition-colors"
              >
                <Pencil size={13} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleSave('address')} className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors">
                  Save
                </button>
                <button onClick={() => handleCancel('address')} className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                <MapPin size={11} />
                Street Address
              </label>
              {isEditingAddress ? (
                <input type="text" value={tempProfile.address} onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              ) : (
                <p className="text-sm font-medium text-slate-800">{profile.address || '—'}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                <MapPin size={11} />
                City
              </label>
              {isEditingAddress ? (
                <select value={tempProfile.city} onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                  <option value="">Select City</option>
                  {NEPAL_CITIES.map((city) => (<option key={city} value={city}>{city}</option>))}
                </select>
              ) : (
                <p className="text-sm font-medium text-slate-800">{profile.city || '—'}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2 block flex items-center gap-1">
                <Globe size={11} />
                Province
              </label>
              {isEditingAddress ? (
                <select value={tempProfile.province} onChange={(e) => updateField('province', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-blue-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                  <option value="">Select Province</option>
                  {NEPAL_PROVINCES.map((prov) => (<option key={prov} value={prov}>{prov}</option>))}
                </select>
              ) : (
                <p className="text-sm font-medium text-slate-800">{profile.province || '—'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
