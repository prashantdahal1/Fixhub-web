"use client";

import { useEffect, useState, type ReactElement } from "react";
import axiosInstance from "../../../lib/api/axios-instance";
import { API } from "../../../lib/api/endpoints";
import { Search, Filter, Loader2, AlertCircle, CheckCircle2, Clock, Trash2, Clock3, AlertTriangle, Eye, X } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../../../components/shared/ConfirmModal";

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

interface DeletionLog {
  _id: string;
  ticketId: string;
  deletedBy?: string;
  reason?: string;
  createdAt: string;
}

type TabType = "tickets" | "deletions";

export default function AdminTicketsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("tickets");

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  // Edit ticket state
  const [editStatus, setEditStatus] = useState<Ticket["status"]>("Under Review");
  const [editCategory, setEditCategory] = useState("");
  const [editTechnician, setEditTechnician] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditCategory(ticket.category || "");
    setEditTechnician(ticket.technicianName || "");
    setEditDescription(ticket.description || "");
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setIsSaving(true);
    try {
      const response = await axiosInstance.patch(API.TICKETS.ADMIN_UPDATE(selectedTicket._id), {
        status: editStatus,
        category: editCategory,
        technicianName: editTechnician,
        description: editDescription,
      });
      const updated = response.data?.data || {
        ...selectedTicket,
        status: editStatus,
        category: editCategory,
        technicianName: editTechnician,
        description: editDescription,
      };
      setTickets((prev) => prev.map((t) => (t._id === selectedTicket._id ? updated : t)));
      setSelectedTicket(updated);
      toast.success("Ticket updated successfully");
    } catch {
      toast.error("Failed to update ticket details");
    } finally {
      setIsSaving(false);
    }
  };
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Deletion logs state
  const [logs, setLogs] = useState<DeletionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API.TICKETS.ADMIN_GET_ALL);
      setTickets(response.data.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load tickets. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await axiosInstance.get(API.TICKET_DELETIONS.ADMIN_GET_ALL);
      setLogs(response.data.data || []);
      setLogsError(null);
    } catch (err) {
      setLogsError("Unable to load deletion audit logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    if (activeTab === "deletions" && logs.length === 0 && !logsLoading) {
      fetchLogs();
    }
  }, [activeTab]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredTickets.map((t) => t._id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Delete confirm modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Tickets?",
      message: `Are you sure you want to delete ${selectedIds.length} ticket(s)? This action cannot be undone.`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await axiosInstance.post(API.TICKETS.ADMIN_BULK_DELETE, { ids: selectedIds });
          setTickets((prev) => prev.filter((t) => !selectedIds.includes(t._id)));
          setSelectedIds([]);
          toast.success("Tickets deleted successfully");
          fetchLogs();
        } catch {
          toast.error("Failed to delete tickets");
        } finally {
          setIsDeleting(false);
          setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSingleDelete = (id: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Ticket?",
      message: "Are you sure you want to delete this ticket? This action cannot be undone.",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await axiosInstance.post(API.TICKETS.ADMIN_BULK_DELETE, { ids: [id] });
          setTickets((prev) => prev.filter((t) => t._id !== id));
          toast.success("Ticket deleted");
          fetchLogs();
        } catch {
          toast.error("Failed to delete ticket");
        } finally {
          setIsDeleting(false);
          setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await axiosInstance.patch(API.TICKETS.ADMIN_UPDATE_STATUS(id), { status: newStatus });
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, status: newStatus as any } : t)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update ticket status.");
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      "Under Review": "bg-amber-50 text-amber-700 border border-amber-200",
      "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
      "Resolved": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    const icons: Record<string, ReactElement> = {
      "Under Review": <Clock className="w-3 h-3" />,
      "In Progress": <Loader2 className="w-3 h-3" />,
      "Resolved": <CheckCircle2 className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-700"}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.ticketId?.toLowerCase().includes(q) || t.bookingId?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and resolve customer service issues</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "tickets" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          All Tickets
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">{tickets.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("deletions")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "deletions" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Deletion Logs
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600">{logs.length}</span>
        </button>
      </div>

      {/* â”€â”€â”€ TICKETS TAB â”€â”€â”€ */}
      {activeTab === "tickets" && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket ID, booking or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedIds.length}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-14 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
                <p className="text-sm font-medium">Loading tickets...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-12 text-red-500">
                <AlertCircle className="h-8 w-8 mb-3" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-14 text-slate-400">
                <CheckCircle2 className="h-10 w-10 mb-3 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-600">All clear!</h3>
                <p className="text-xs mt-1">No tickets match your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80">
                    <tr>
                      <th className="px-4 py-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredTickets.length > 0 && selectedIds.length === filteredTickets.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ticket ID</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Booking</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(ticket._id)}
                            onChange={() => handleSelectOne(ticket._id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-slate-900">{ticket.ticketId}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-semibold text-slate-800">{ticket.bookingId ? ticket.bookingId.slice(-8).toUpperCase() : "N/A"}</p>
                          {ticket.technicianName && <p className="text-[11px] text-slate-500">{ticket.technicianName}</p>}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200/60 rounded-md text-xs font-medium capitalize">
                            {ticket.category || "General"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-xs text-slate-600 max-w-[220px] truncate" title={ticket.description}>
                            {ticket.description}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap font-medium">
                          {new Date(ticket.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openTicketModal(ticket)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              View
                            </button>
                            <button
                              onClick={() => handleSingleDelete(ticket._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete ticket"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── DELETION LOGS TAB ─── */}
      {activeTab === "deletions" && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">Deleted Ticket Audit Logs</h2>
            </div>
            <button onClick={fetchLogs} disabled={logsLoading}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Loader2 className={`w-3 h-3 ${logsLoading ? "animate-spin" : "hidden"}`} /> Refresh
            </button>
          </div>

          {logsLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin mb-3 text-blue-600" />
              <p className="text-sm">Loading audit logs...</p>
            </div>
          ) : logsError ? (
            <div className="flex flex-col items-center p-10 text-slate-600 gap-3">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
              <p className="text-sm">{logsError}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 text-slate-400">
              <Clock3 className="h-10 w-10 mb-3 text-slate-300" />
              <p className="text-sm font-medium">No ticket deletion records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit ID</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket ID</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deleted By</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deleted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500 font-bold">{log._id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-3.5 font-mono text-xs text-rose-600 font-bold">{log.ticketId}</td>
                      <td className="px-6 py-3.5 text-sm text-slate-700">{log.deletedBy || "-"}</td>
                      <td className="px-6 py-3.5 text-sm text-slate-500 max-w-[200px] truncate">{log.reason || "No reason provided"}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-400">{new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TICKET DETAIL & EDIT MODAL ─── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Ticket {selectedTicket.ticketId}</h2>
                <p className="text-xs text-slate-500">Created on {new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Booking ID</label>
                  <p className="text-sm font-semibold text-slate-800">{selectedTicket.bookingId || "N/A"}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <label htmlFor="ticket-status-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                  <select
                    id="ticket-status-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <label htmlFor="ticket-category-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                  <input
                    id="ticket-category-input"
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. Plumbing, Billing..."
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <label htmlFor="ticket-tech-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Technician / Support</label>
                  <input
                    id="ticket-tech-input"
                    type="text"
                    value={editTechnician}
                    onChange={(e) => setEditTechnician(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Assigned staff..."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                <label htmlFor="ticket-desc-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description / Issue Notes</label>
                <textarea
                  id="ticket-desc-input"
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ticket description details..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTicket}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-60"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.title}
        message={deleteConfirmState.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirmState.onConfirm}
      />
    </div>
  );
}

