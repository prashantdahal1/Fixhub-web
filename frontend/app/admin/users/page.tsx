"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  MapPin,
  Clock,
  User,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  username?: string;
  phoneNumber?: string;
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

function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: UserRow | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(user?.role ?? "customer");
  const [status, setStatus] = useState(user?.status ?? "active");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Something went wrong");
        return;
      }

      onSave();
      onClose();
    } catch (err) {
      setError("Failed to save user");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sneha Rai"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@fixhub.com"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:border-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="expert">Expert</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            {user ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalUser, setModalUser] = useState<UserRow | null | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?page=${page}&size=${pageSize}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const body = await res.json();
        setUsers(body.data || []);
        setTotalPages(body.meta?.totalPages || 1);
        setTotalItems(body.meta?.totalItems || 0);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setSelectedIds([]);
    setExpandedIds([]);
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map((u) => u.id));
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
            Registered Users
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

          <button
            onClick={() => setModalUser(null)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

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
                  const isExpanded = expandedIds.includes(user.id);
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <React.Fragment key={user.id}>
                      <tr
                        onClick={() => toggleExpand(user.id)}
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors ${
                          isExpanded ? "bg-slate-50/30" : isSelected ? "bg-blue-50/10" : ""
                        }`}
                      >
                        <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(user.id)}
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
                          {user.name}
                        </td>
                        <td className="px-4 py-2 text-slate-400 font-normal">{user.email}</td>
                        <td className="px-4 py-2">
                          {(() => {
                            const style = roleBadgeStyles[user.role.toLowerCase()] || roleBadgeStyles.customer;
                            return (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border capitalize ${style.bg}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                {user.role}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-2">
                          {(() => {
                            const style = statusBadgeStyles[user.status.toLowerCase()] || statusBadgeStyles.active;
                            return (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border capitalize ${style.bg}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                {user.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center bg-slate-50 border border-slate-200/80 rounded-lg p-0.5 shadow-sm">
                            <button
                              onClick={() => setModalUser(user)}
                              className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                              title="Edit User"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all"
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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
                                    {getMockLastLogin(user.id)}
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
                                    {getMockAddress(user.id)}
                                  </p>
                                </div>
                              </div>

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
      )}
    </div>
  );
}
