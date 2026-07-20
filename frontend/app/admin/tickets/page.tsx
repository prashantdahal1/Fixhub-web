"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../../lib/api/axios-instance";
import { API } from "../../../lib/api/endpoints";
import { Search, Filter, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Ticket {
  _id: string;
  ticketId: string;
  bookingId: string;
  technicianName: string;
  category: string;
  description: string;
  status: "Under Review" | "In Progress" | "Resolved";
  createdAt: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API.TICKETS.ADMIN_GET_ALL);
      setTickets(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await axiosInstance.patch(API.TICKETS.ADMIN_UPDATE_STATUS(id), { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus as any } : t))
      );
    } catch (err) {
      alert("Failed to update ticket status.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Under Review":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Reviewing</span>;
      case "In Progress":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Loader2 className="w-3.5 h-3.5" /> In Progress</span>;
      case "Resolved":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and resolve customer service issues.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ID or Booking..." 
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p>Loading support tickets...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500">
            <AlertCircle className="w-8 h-8 mb-4" />
            <p>{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mb-4 text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-900">All clear!</h3>
            <p>No active support tickets right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Ticket ID</th>
                  <th className="px-6 py-4 font-semibold">Booking Context</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Issue Details</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-slate-900">{ticket.ticketId}</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{ticket.bookingId}</div>
                      <div className="text-xs text-slate-500 mt-1">Tech: {ticket.technicianName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px] truncate text-slate-600" title={ticket.description}>
                        {ticket.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket._id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer bg-white"
                      >
                        <option value="Under Review">Mark Under Review</option>
                        <option value="In Progress">Mark In Progress</option>
                        <option value="Resolved">Mark Resolved</option>
                      </select>
                    </td>
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
