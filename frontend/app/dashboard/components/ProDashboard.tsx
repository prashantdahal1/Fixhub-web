"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import CreateServiceForm from "./CreateServiceForm";

export default function ProDashboard() {
  const { user } = useAuth();
  const name = user?.firstName || "Professional";
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!user?.isVerified) {
    return (
      <div className="max-w-5xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {name}!</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome to your Professional Dashboard.</p>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-lg font-semibold text-yellow-800">Account Pending Verification</h2>
          <p className="text-sm text-yellow-700 mt-2">
            Your account is currently under review. Once your Industrial/Business License is verified by an administrator, you will be able to post and manage your services.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {name}!</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your services and bookings.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          {showCreateForm ? "Cancel" : "Post New Service"}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create a New Service</h2>
          <CreateServiceForm onSuccess={() => setShowCreateForm(false)} />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Active Services</h2>
        {/* Placeholder for fetching and displaying professional's services */}
        <p className="text-sm text-slate-500">You haven't posted any services yet. Click "Post New Service" to get started.</p>
      </div>
    </div>
  );
}
