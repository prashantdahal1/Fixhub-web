"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar, Clock, MapPin, Phone, Star, AlertTriangle, Shield, CheckCircle2, X, AlertOctagon, Upload, Paperclip, Loader2 } from "lucide-react";
import axiosInstance from "../../../lib/api/axios-instance";
import { API } from "../../../lib/api/endpoints";

interface Booking {
  id: string;
  category: "Electrician" | "Plumber" | "Painter" | "Carpenter" | "AC Repair";
  title: string;
  status: "In Progress" | "Technician Dispatched" | "Awaiting Parts" | "Scheduled";
  statusText: string;
  technician: { name: string; phone: string; rating: number; initials: string; } | null;
  date: string;
  time: string;
  eta: string;
  location: string;
  description: string;
  notes: string;
  currentStep: number;
}

const BoltIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(37,99,235,0.08)" /></svg>);
const WrenchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>);
const PaintIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="14" height="8" rx="2" fill="rgba(37,99,235,0.08)" /><path d="M5 11v4" /><rect x="3" y="15" width="4" height="5" rx="1" fill="rgba(37,99,235,0.08)" /><line x1="17" y1="7" x2="21" y2="7" /></svg>);
const HammerIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" /><path d="M17.64 15L22 10.64" /><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.75l-2.25-2.25H14l-.34.34-.75-.75-.34.34L9 6.5l.75.75L9 8l1.5 1.5 1.5-1.5 3 3z" /></svg>);
const ACIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="9" rx="2" fill="rgba(37,99,235,0.08)" /><line x1="2" y1="10" x2="22" y2="10" /><path d="M6 19c0-2 2-4 6-4s6 2 6 4" /></svg>);

const MOCK_BOOKINGS: Booking[] = [
  { id: "FH-2026-0941", category: "AC Repair", title: "AC Deep Clean & Performance Service", status: "In Progress", statusText: "In Progress", technician: { name: "Rohan Shrestha", phone: "+977 9851012345", rating: 4.8, initials: "RS" }, date: "July 09, 2026", time: "02:30 PM", eta: "Currently performing deep clean - 15 mins left", location: "Bakhundole, Lalitpur", description: "Indoor unit is leaking water and the airflow is significantly blocked by dust. Needs deep clean and check on refrigerant levels.", notes: "Please call 5 minutes before arriving. Resident is at home.", currentStep: 3 },
  { id: "FH-2026-0942", category: "Plumber", title: "Water Tank Outlet Pipe Leak Repair", status: "Technician Dispatched", statusText: "Technician Dispatched", technician: { name: "Suman Maharjan", phone: "+977 9841987654", rating: 4.9, initials: "SM" }, date: "July 09, 2026", time: "04:00 PM", eta: "Arriving in 12 mins (En route via motorcycle)", location: "Jhamsikhel, Lalitpur", description: "Outlet pipe connecting the overhead water tank has a continuous hairline crack causing major water wastage.", notes: "Access to the rooftop is available via the external spiral staircase.", currentStep: 2 },
  { id: "FH-2026-0943", category: "Electrician", title: "Main DB Fuse Board Replacement", status: "Awaiting Parts", statusText: "Awaiting Parts", technician: { name: "Anil Thapa", phone: "+977 9803123456", rating: 4.7, initials: "AT" }, date: "July 10, 2026", time: "10:00 AM", eta: "Pending 63A MCB shipment delivery - Rescheduling to tomorrow morning", location: "Koteshwor, Kathmandu", description: "Legacy rewireable fuse board keeps tripping under load. Scheduled replacement with a modern MCB distribution board.", notes: "Power outage required for approximately 1.5 hours.", currentStep: 1 },
  { id: "FH-2026-0944", category: "Carpenter", title: "Main Entrance Wooden Door Hinge Alignment", status: "Scheduled", statusText: "Scheduled", technician: null, date: "July 12, 2026", time: "11:30 AM", eta: "Technician matching in progress", location: "Sanepa, Lalitpur", description: "Heavy solid teakwood main door is sagging and scraping against the tile floor. Needs heavy-duty alignment hinges.", notes: "Requires brass-colored hinges to match existing hardware.", currentStep: 0 }
];

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState("Quality");
  const [ticketDesc, setTicketDesc] = useState("");
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState("");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Electrician": return <BoltIcon />;
      case "Plumber": return <WrenchIcon />;
      case "Painter": return <PaintIcon />;
      case "Carpenter": return <HammerIcon />;
      case "AC Repair": return <ACIcon />;
      default: return <WrenchIcon />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "In Progress":
        return { bg: "bg-blue-50 border-blue-200 text-blue-700", dot: "bg-blue-500" };
      case "Technician Dispatched":
        return { bg: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" };
      case "Awaiting Parts":
        return { bg: "bg-rose-50 border-rose-200 text-rose-700", dot: "bg-rose-500" };
      case "Scheduled":
        return { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" };
      default:
        return { bg: "bg-gray-50 border-gray-200 text-gray-700", dot: "bg-gray-500" };
    }
  };

  const handleEmergencyOverride = (bookingId: string) => alert(`Emergency Override Triggered for booking ${bookingId}. Operations command notified.`);
  const handleReschedule = (bookingId: string) => {
    const time = prompt("Enter new preferred date/time (e.g. July 15, 03:00 PM):");
    if (time) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, date: time.split(",")[0], time: time.split(",")[1] || b.time } : b));
      if (selectedBooking?.id === bookingId) setSelectedBooking(prev => prev ? { ...prev, date: time.split(",")[0], time: time.split(",")[1] || prev.time } : null);
    }
  };

  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    setIsSubmittingTicket(true);
    try {
      const response = await axiosInstance.post(API.TICKETS.CREATE, {
        bookingId: selectedBooking.id,
        technicianName: selectedBooking.technician?.name || "Unassigned",
        category: ticketCategory,
        description: ticketDesc,
      });
      
      setGeneratedTicketId(response.data.data.ticketId);
      setIsTicketSubmitted(true);
    } catch (error) {
      console.error("Failed to submit ticket:", error);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Reset ticket form state after drawer closing transition completes
    setTimeout(() => {
      setIsTicketSubmitted(false);
      setTicketDesc("");
      setTicketCategory("Quality");
    }, 300);
  };

  const timelineSteps = ["Booking Confirmed", "Technician Assigned", "En Route", "In Progress", "Completed"];

  return (
    <div className="h-full flex flex-col space-y-5 relative overflow-hidden">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-sm text-slate-500 mt-1">Track and manage your active service bookings in real time.</p>
      </div>

      {/* Main Layout (Master-Detail Pattern) */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Selection List Panel */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto pr-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {bookings.length} Active Booking{bookings.length !== 1 ? "s" : ""}
          </p>

          {bookings.map((booking) => {
            const style = getStatusStyle(booking.status);
            const isSelected = selectedBooking?.id === booking.id;

            return (
              <button
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "bg-slate-50 border-blue-500 shadow-sm"
                    : "bg-white border-slate-100 hover:bg-slate-50/50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(booking.category)}
                    <span className="text-[14px] font-semibold text-slate-900 leading-tight">{booking.title}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] font-mono text-slate-400">{booking.id}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.bg}`}>
                    <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                    {booking.statusText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail Content View */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {selectedBooking ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Header Title Grid */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <h2 className="text-[17px] font-bold text-slate-900">{selectedBooking.title}</h2>
                  <p className="text-xs font-mono text-slate-400">Reference: {selectedBooking.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="rounded-lg border border-red-200 text-red-600 bg-red-50/30 text-xs font-semibold px-3 py-1.5 hover:bg-red-50 transition-colors"
                  >
                    Report Issue
                  </button>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedBooking.status).bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(selectedBooking.status).dot}`} />
                    {selectedBooking.statusText}
                  </span>
                </div>
              </div>

              {/* Appointment Details Row (grouped icon-label pairs) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Appointment Date</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedBooking.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Preferred Time</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedBooking.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Target Location</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{selectedBooking.location}</p>
                  </div>
                </div>
              </div>

              {/* Progress Flow Sequence */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Operations sequence tracking</p>
                <div className="relative pl-6 border-l border-slate-200 space-y-5 py-1">
                  {timelineSteps.map((stepName, index) => {
                    const isCompleted = index < selectedBooking.currentStep;
                    const isActive = index === selectedBooking.currentStep;
                    return (
                      <div key={stepName} className="relative flex items-start">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-blue-600 border-blue-600 text-white"
                              : isActive
                              ? "bg-white border-blue-600 ring-4 ring-blue-50"
                              : "bg-white border-slate-200"
                          }`}
                          style={{ width: "17px", height: "17px" }}
                        >
                          {isCompleted && (
                            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />}
                        </div>

                        {/* Title and ETA */}
                        <div className="ml-1">
                          <p className={`text-sm font-semibold ${isActive ? "text-blue-600" : "text-slate-700"}`}>
                            {stepName}
                          </p>
                          {isActive && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {selectedBooking.eta}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Issue description & details</p>
                <p className="text-sm text-slate-600 leading-relaxed pt-1">{selectedBooking.description}</p>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Site Entry notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Technician Profile */}
              {selectedBooking.technician && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned specialist</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {selectedBooking.technician.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{selectedBooking.technician.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{selectedBooking.technician.phone}</span>
                        </div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 bg-white border border-slate-100 rounded-lg px-2.5 py-1 shadow-sm shrink-0">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {selectedBooking.technician.rating}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={() => handleReschedule(selectedBooking.id)}
                  className="rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  Reschedule Appointment
                </button>
                <button
                  onClick={() => handleEmergencyOverride(selectedBooking.id)}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 transition-colors ml-auto"
                >
                  Emergency Override
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50">
              <svg className="w-10 h-10 text-slate-300 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-sm font-semibold text-slate-700">No Booking Selected</h3>
              <p className="text-xs text-slate-400 max-w-[240px] mt-1 leading-relaxed">
                Select an active booking card from the panel to view its operational tracker and technician coordinates.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── Context-Aware Pop-up Modal (Support Ticket Flow) ── */}
      {isDrawerOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay backdrop with dim & backdrop blur */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[6px] transition-opacity" onClick={closeDrawer} />
          
          {/* Modal container (Wider, shallower, no scroll) */}
          <div className="relative w-full max-w-[600px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col z-10 transition-all duration-300 scale-100 p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Report an Issue</h3>
                <p className="text-sm text-slate-500 mt-1">File a support ticket for {selectedBooking.title}</p>
              </div>
              <button onClick={closeDrawer} className="p-2 -mr-2 -mt-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content (No scroll wrapper) */}
            <div>
              {!isTicketSubmitted ? (
                <form onSubmit={submitTicket} className="space-y-6">
                  {/* Context Pre-filled Metadata Info (Single Line) */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Booking ID</p>
                      <p className="font-mono text-slate-700 font-medium mt-0.5">{selectedBooking.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Technician</p>
                      <p className="text-slate-700 font-medium mt-0.5">{selectedBooking.technician?.name || "Unassigned"}</p>
                    </div>
                  </div>

                  {/* Issue Category selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Category</label>
                    <div className="flex gap-2 flex-wrap">
                      {["Quality", "Delay", "Payment", "Professionalism"].map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setTicketCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                            ticketCategory === cat
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Provide details</label>
                    <textarea
                      required
                      rows={3}
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      placeholder="Describe the issue you encountered..."
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700 placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {/* Drag-and-drop Attachment Mock (Compact) */}
                  <div className="border border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-slate-50/50 flex items-center justify-center gap-2 group">
                    <Paperclip className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">Attach photos or logs (Optional)</span>
                  </div>

                  {/* Action button (Bottom Right) */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="mr-3 px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTicket}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSubmittingTicket && <Loader2 className="w-4 h-4 animate-spin" />}
                      Submit Ticket
                    </button>
                  </div>
                </form>
              ) : (
                /* Success feedback confirmation view */
                <div className="flex flex-col items-center justify-center text-center space-y-5 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Ticket Submitted</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1">
                      Your issue report has been registered. Our ops coordinator will review your case.
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Ticket Reference ID</span>
                      <span className="font-mono font-bold text-slate-700">{generatedTicketId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Expected Response</span>
                      <span className="text-slate-700 font-semibold">Within 2 Hours</span>
                    </div>
                  </div>

                  <button
                    onClick={closeDrawer}
                    className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 transition-colors mt-2 shadow-sm"
                  >
                    Back to Bookings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
