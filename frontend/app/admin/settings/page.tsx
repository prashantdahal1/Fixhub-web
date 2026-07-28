"use client";

import { Save, Bell, Shield, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage global platform configurations, security settings, and notifications</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#2563EB]" /> General Platform Settings
          </h2>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="FixHub"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Support Contact Email
              </label>
              <input
                type="email"
                defaultValue="support@fixhub.com"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-[#2563EB]" /> Admin Notifications
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Alerts for Disputes</p>
                <p className="text-xs text-slate-400">Receive instant email updates when customer disputes are lodged</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
              <div>
                <p className="text-sm font-semibold text-slate-800">Expert Verification Notifications</p>
                <p className="text-xs text-slate-400">Get notified when new technicians complete document uploads</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]" />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button className="flex items-center gap-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

