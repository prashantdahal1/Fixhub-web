"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  MapPin,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UserRow {
  _id: string;
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  username?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  verificationDocument?: string;
}

const roleBadgeStyles: Record<string, { bg: string; dot: string }> = {
  admin: {
    bg: "bg-blue-50/70 text-blue-700 border border-blue-100/50",
    dot: "bg-blue-500",
  },
  expert: {
    bg: "bg-emerald-50/70 text-emerald-700 border border-emerald-100/50",
    dot: "bg-emerald-500",
  },
  customer: {
    bg: "bg-slate-100/70 text-slate-600 border border-slate-200/50",
    dot: "bg-slate-400",
  },
};

const statusBadgeStyles: Record<string, { bg: string; dot: string }> = {
  active: {
    bg: "bg-emerald-50/70 text-emerald-700 border border-emerald-100/50",
    dot: "bg-emerald-500",
  },
  pending: {
    bg: "bg-amber-50/70 text-amber-700 border border-amber-100/50",
    dot: "bg-amber-500",
  },
  suspended: {
    bg: "bg-rose-50/70 text-rose-700 border border-rose-100/50",
    dot: "bg-rose-500",
  },
};

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete user",
  message = "Are you sure you want to delete this user? This action cannot be undone.",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
        {/* Red warning icon with glow */}
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4 ring-8 ring-red-50/50">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>

        <h3 className="text-[17px] font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed px-2 mb-6">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-sm font-semibold text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors shadow-sm shadow-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: UserRow | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [firstName, setFirstName] = useState(user?.firstName || (user?.name ?? "").split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.lastName || (user?.name ?? "").split(" ").slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [address, setAddress] = useState((user as any)?.address ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState((user as any)?.profilePicture ?? "");
  const [role, setRole] = useState(user?.role ?? "customer");
  const [status, setStatus] = useState(user?.status ?? "active");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!user && !password) {
      setError("Password is required for new users");
      return;
    }
    try {
      const url = user ? `/api/v1/admin/users/${user._id}` : "/api/v1/admin/users";
      const method = user ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("username", username);
      formData.append("phoneNumber", formatPhoneNumber(phoneNumber));
      formData.append("address", address);
      formData.append("role", role === "expert" ? "professional" : role);
      formData.append("status", status);
      if (password) {
        formData.append("password", password);
      }

      let response;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const authHeaders: Record<string, string> = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
        const responseFormData = await fetch(url, {
          method,
          body: formData,
          headers: authHeaders,
          credentials: 'include'
        });
        response = responseFormData;
      } else {
        // Fallback to sending JSON if no file, matching existing structure
        const responseJson = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...authHeaders
          },
          credentials: 'include',
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            username,
            phoneNumber,
            address,
            role: role === "expert" ? "professional" : role,
            status,
            password: password || undefined,
            profilePicture: avatarPreview // Keep existing profile picture url if not changing it
          }),
        });
        response = responseJson;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || data.message || "Something went wrong");
        return;
      }

      onSave();
      onClose();
      toast.success(user ? 'User updated successfully' : 'User created successfully');
    } catch (err) {
      setError('Failed to save user');
      toast.error('Failed to save user');
    }
  };

  const inputCls = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <label className={labelCls}>Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => { setAvatarFile(null); setAvatarPreview(""); }}
                    className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 shadow hover:bg-red-50 hover:border-red-300 transition"
                  >
                    <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                  </button>
                </>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl font-semibold border-2 border-dashed border-gray-300">
                  {firstName ? firstName[0].toUpperCase() : <User className="h-6 w-6" />}
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAvatarFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setAvatarPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-6 py-5 space-y-4 max-h-[50vh] overflow-y-auto">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={inputCls}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@fixhub.com"
              className={inputCls}
            />
          </div>

          {/* Password (only for new users) */}
          {!user && (
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
          )}

          {/* Username + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9800000000"
                className={inputCls}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelCls}>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Kathmandu"
              className={inputCls}
            />
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputCls}
              >
                <option value="admin">Admin</option>
                <option value="expert">Expert</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-95 transition"
          >
            {user ? "Save Changes" : "Create User"}
          </button>
        </div>

      </div>
    </div>
  );
}

// Helper: ensure Nepali numbers start with +977
function formatPhoneNumber(input: string): string {
  const trimmed = input.trim();
  // If it already starts with '+' assume it's international
  if (trimmed.startsWith('+')) return trimmed;
  // If it looks like a Nepali local number (10 digits) prepend +977
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `+977${digitsOnly}`;
  }
  // otherwise return as‑is (validation will catch later)
  return trimmed;
}

const getMockLastLogin = (userId: string) => {
  const sum = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hours = sum % 24;
  const days = (sum % 7) + 1;
  if (sum % 5 === 0) return "Active now";
  if (sum % 5 === 1) return "1 hour ago";
  if (sum % 5 === 2) return `${hours} hours ago`;
  if (sum % 5 === 3) return "Yesterday";
  return `${days} days ago`;
};

const getMockAddress = (userId: string) => {
  const cities = ["Kathmandu, Nepal", "Lalitpur, Nepal", "Bhaktapur, Nepal", "Pokhara, Nepal", "Biratnagar, Nepal"];
  const streets = ["New Road", "Koteshwor", "Putalisadak", "Lakeside", "Baneshwor", "Jawalakhel"];
  const sum = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const street = streets[sum % streets.length];
  const city = cities[sum % cities.length];
  return `${(sum % 100) + 1} ${street} St, ${city}`;
};

export default function RegisteredUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalUser, setModalUser] = useState<UserRow | null | undefined>(undefined);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/v1/admin/users?page=${page}&size=${pageSize}&search=${encodeURIComponent(search)}&role=${filterRole}&status=${filterStatus}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to fetch users:', res.status, errorText);
        return;
      }
      const body = await res.json();
      setUsers(body.data || []);
      setTotalPages(body.meta?.totalPages || 1);
      setTotalItems(body.meta?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setSelectedIds([]);
    setExpandedIds([]);
  }, [page, search, filterRole, filterStatus]);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/v1/admin/users/${deleteTargetId}`, {
        method: "DELETE",
        headers,
        credentials: 'include'
      });
      if (res.ok) {
        fetchUsers();
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err) {
      toast.error('An error occurred while deleting');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await Promise.all(selectedIds.map(id =>
        fetch(`/api/v1/admin/users/${id}`, { method: 'DELETE', headers, credentials: 'include' })
      ));
      toast.success(`${selectedIds.length} user${selectedIds.length!==1 ? 's' : ''} deleted`);
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete selected users');
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map((u) => u._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-700 tracking-tight">
            Users
          </h1>
          <p className="text-sm text-slate-400 mt-0.5 font-normal">
            {totalItems} {totalItems === 1 ? "user" : "users"} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm animate-fade-in">
              <span>{selectedIds.length} selected</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-blue-400 hover:text-blue-600 p-0.5 rounded-full hover:bg-blue-100/50 transition"
                title="Clear selection"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="ml-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search users..."
              className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-sm focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)] transition-all duration-200"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none shadow-sm focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)] transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="professional">Expert</option>
            <option value="customer">Customer</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none shadow-sm focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)] transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            onClick={() => setModalUser(null)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedIds.length} users?`}
        message={`This will permanently delete ${selectedIds.length} user${selectedIds.length!==1 ? 's' : ''}. This action cannot be undone.`}
      />

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40">
                <th className="w-10 px-4 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                  />
                </th>
                <th className="w-8 px-2 py-2.5"></th>
                <th className="text-left font-medium text-slate-400 text-[11px] uppercase tracking-[0.06em] px-4 py-2.5">
                  Name
                </th>
                <th className="text-left font-medium text-slate-400 text-[11px] uppercase tracking-[0.06em] px-4 py-2.5">
                  Email
                </th>
                <th className="text-left font-medium text-slate-400 text-[11px] uppercase tracking-[0.06em] px-4 py-2.5">
                  Role
                </th>
                <th className="text-left font-medium text-slate-400 text-[11px] uppercase tracking-[0.06em] px-4 py-2.5">
                  Status
                </th>
                <th className="text-right font-medium text-slate-400 text-[11px] uppercase tracking-[0.06em] px-4 py-2.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isExpanded = expandedIds.includes(user._id);
                  const isSelected = selectedIds.includes(user._id);
                  return (
                    <React.Fragment key={user._id}>
                      <tr
                        onClick={() => toggleExpand(user._id)}
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors ${
                          isExpanded ? "bg-slate-50/30" : isSelected ? "bg-blue-50/10" : ""
                        }`}
                      >
                        <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(user._id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-2 text-center text-slate-400">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-blue-600" : ""
                            }`}
                          />
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-700">
                          {user.firstName || user.lastName ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : user.name || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-slate-400 font-normal">{user.email}</td>
                        <td className="px-4 py-2">
                          {(() => {
                            const style = roleBadgeStyles[user.role?.toLowerCase() || ''] || roleBadgeStyles.customer;
                            return (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border capitalize ${style.bg}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                {user.role || 'Customer'}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-2">
                          {(() => {
                            const style = statusBadgeStyles[user.status?.toLowerCase() || ''] || statusBadgeStyles.active;
                            return (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border capitalize ${style.bg}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                {user.status || 'Active'}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            {/* 3-dot kebab trigger */}
                            <button
                              onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
                              title="Actions"
                            >
                              {/* Vertical three dots */}
                              <span className="flex flex-col items-center gap-[3px]">
                                <span className="block w-[3.5px] h-[3.5px] rounded-full bg-current" />
                                <span className="block w-[3.5px] h-[3.5px] rounded-full bg-current" />
                                <span className="block w-[3.5px] h-[3.5px] rounded-full bg-current" />
                              </span>
                            </button>

                            {/* Dropdown menu */}
                            {openMenuId === user._id && (
                              <div
                                className="absolute right-0 top-9 z-50 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-100"
                                onMouseLeave={() => setOpenMenuId(null)}
                              >
                                <button
                                  onClick={() => { setModalUser(user); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-lg"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  Edit User
                                </button>
                                <button
                                  onClick={() => { handleDelete(user._id); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors rounded-lg"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/20 border-b border-slate-100 last:border-0">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1">
                              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-100">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                  <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-medium text-slate-400 tracking-wider">Join Date</p>
                                  <p className="text-[13px] font-medium text-slate-600 mt-0.5">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-100">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                  <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-medium text-slate-400 tracking-wider">Last Login</p>
                                  <p className="text-[13px] font-medium text-slate-600 mt-0.5">
                                    {getMockLastLogin(user._id)}
                                  </p>
                                </div>
                              </div>

                               <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-100">
                                 <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                   <MapPin className="h-4 w-4" />
                                 </div>
                                 <div>
                                   <p className="text-[10px] uppercase font-medium text-slate-400 tracking-wider">Address</p>
                                   <p className="text-[13px] font-medium text-slate-600 mt-0.5">
                                     {(user as any).address || ""}
                                   </p>
                                 </div>
                               </div>
                               {/* Avatar thumbnail in expanded view */}
                               {(user as any).profilePicture && (
                                 <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-100">
                                   <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                     <img src={(user as any).profilePicture} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                                   </div>
                                   <div>
                                     <p className="text-[10px] uppercase font-medium text-slate-400 tracking-wider">Avatar</p>
                                   </div>
                                 </div>
                               )}

                              {(user.username || user.phoneNumber) && (
                                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 border-t border-slate-100 pt-3">
                                  {user.username && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                                      <User className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                      <span className="font-medium text-slate-400 text-[10px] uppercase tracking-wider">Username</span>
                                      <span className="font-medium text-slate-600 text-[13px]">{user.username}</span>
                                    </div>
                                  )}
                                  {user.phoneNumber && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                                      <Clock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                      <span className="font-medium text-slate-400 text-[10px] uppercase tracking-wider">Phone</span>
                                      <span className="font-medium text-slate-600 text-[13px]">{user.phoneNumber}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
          <p className="text-sm text-slate-400 font-normal">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                  page === n
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {modalUser !== undefined && (
        <UserModal user={modalUser} onClose={() => setModalUser(undefined)} onSave={fetchUsers} />
      ) }
      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete user"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
      <ToastContainer />
    </div>
  );
}
