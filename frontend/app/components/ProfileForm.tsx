"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileForm() {
  const { user, fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: (user as any).username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    if (file) {
      data.append('avatar', file);
    }

    try {
      const res = await fetch('/api/v1/auth/update', {
        method: 'PUT',
        body: data,
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        await fetchUser();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setMessage('An error occurred during update.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto p-4 border rounded">
      {message && <div className="text-sm font-semibold">{message}</div>}
      
      <div className="flex flex-col">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="avatar">Profile Picture</label>
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Update Profile
      </button>
    </form>
  );
}
