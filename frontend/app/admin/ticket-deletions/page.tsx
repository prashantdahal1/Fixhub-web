"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../../lib/api/axios-instance";
import { API } from "../../../lib/api/endpoints";
import { Clock, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface TicketDeletionLog {
  _id: string;
  ticketId: string;
  deletedBy?: string;
  reason?: string;
  createdAt: string;
}

export default function AdminTicketDeletionLogsPage() {
  const [logs, setLogs] = useState<TicketDeletionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API.TICKET_DELETIONS.ADMIN_GET_ALL);
      setLogs(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch ticket deletion logs:", err);
      setError("Unable to load deletion audit logs. Please try again later.");
      toast.error("Unable to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Deleted Ticket Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Review recently deleted tickets and cleanup actions by admins.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
            <p className="text-sm">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 p-8 text-slate-600">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-amber-700 border border-amber-200">
              <AlertTriangle className="h-4 w-4" /> Warning
            </div>
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500">
            <Clock className="h-10 w-10 mb-4 text-slate-300" />
            <p className="text-sm">No ticket deletion audit entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-6 py-4">Audit ID</th>
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Deleted By</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Deleted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-700">{log._id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{log.ticketId}</td>
                    <td className="px-6 py-4 text-slate-600">{log.deletedBy || "System"}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-sm truncate">{log.reason || "-"}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
