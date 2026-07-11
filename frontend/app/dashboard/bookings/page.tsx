"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

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

const BoltIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(37,99,235,0.08)" /></svg>);
const WrenchIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>);
const PaintIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="14" height="8" rx="2" fill="rgba(37,99,235,0.08)" /><path d="M5 11v4" /><rect x="3" y="15" width="4" height="5" rx="1" fill="rgba(37,99,235,0.08)" /><line x1="17" y1="7" x2="21" y2="7" /></svg>);
const HammerIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" /><path d="M17.64 15L22 10.64" /><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.75l-2.25-2.25H14l-.34.34-.75-.75-.34.34L9 6.5l.75.75L9 8l1.5 1.5 1.5-1.5 3 3z" /></svg>);
const ACIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="9" rx="2" fill="rgba(37,99,235,0.08)" /><line x1="2" y1="10" x2="22" y2="10" /><path d="M6 19c0-2 2-4 6-4s6 2 6 4" /></svg>);
const StarIcon = () => (<svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);

const MOCK_BOOKINGS: Booking[] = [
  { id: "FH-2026-0941", category: "AC Repair", title: "AC Deep Clean & Performance Service", status: "In Progress", statusText: "In Progress", technician: { name: "Rohan Shrestha", phone: "+977 9851012345", rating: 4.8, initials: "RS" }, date: "July 09, 2026", time: "02:30 PM", eta: "Currently performing deep clean - 15 mins left", location: "Bakhundole, Lalitpur", description: "Indoor unit is leaking water and the airflow is significantly blocked by dust. Needs deep clean and check on refrigerant levels.", notes: "Please call 5 minutes before arriving. Resident is at home.", currentStep: 3 },
  { id: "FH-2026-0942", category: "Plumber", title: "Water Tank Outlet Pipe Leak Repair", status: "Technician Dispatched", statusText: "Technician Dispatched", technician: { name: "Suman Maharjan", phone: "+977 9841987654", rating: 4.9, initials: "SM" }, date: "July 09, 2026", time: "04:00 PM", eta: "Arriving in 12 mins (En route via motorcycle)", location: "Jhamsikhel, Lalitpur", description: "Outlet pipe connecting the overhead water tank has a continuous hairline crack causing major water wastage.", notes: "Access to the rooftop is available via the external spiral staircase.", currentStep: 2 },
  { id: "FH-2026-0943", category: "Electrician", title: "Main DB Fuse Board Replacement", status: "Awaiting Parts", statusText: "Awaiting Parts", technician: { name: "Anil Thapa", phone: "+977 9803123456", rating: 4.7, initials: "AT" }, date: "July 10, 2026", time: "10:00 AM", eta: "Pending 63A MCB shipment delivery - Rescheduling to tomorrow morning", location: "Koteshwor, Kathmandu", description: "Legacy rewireable fuse board keeps tripping under load. Scheduled replacement with a modern MCB distribution board.", notes: "Power outage required for approximately 1.5 hours.", currentStep: 1 },
  { id: "FH-2026-0944", category: "Carpenter", title: "Main Entrance Wooden Door Hinge Alignment", status: "Scheduled", statusText: "Scheduled", technician: null, date: "July 12, 2026", time: "11:30 AM", eta: "Technician matching in progress", location: "Sanepa, Lalitpur", description: "Heavy solid teakwood main door is sagging and scraping against the tile floor. Needs heavy-duty alignment hinges.", notes: "Requires brass-colored hinges to match existing hardware.", currentStep: 0 }
];

export default function BookingsPage() {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(MOCK_BOOKINGS[0]);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

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
        return { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-500", bar: "bg-blue-500" };
      case "Technician Dispatched":
        return { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-400", bar: "bg-amber-400" };
      case "Awaiting Parts":
        return { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-400", bar: "bg-rose-400" };
      case "Scheduled":
        return { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" };
      default:
        return { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", dot: "bg-gray-400", bar: "bg-gray-400" };
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

  const timelineSteps = ["Booking Confirmed", "Technician Assigned", "En Route", "In Progress", "Completed"];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-sm text-slate-500 mt-1">Track and manage your active service bookings in real time.</p>
      </div>

      {/* Main Layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Pane — Booking List */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {bookings.length} Active Booking{bookings.length !== 1 ? "s" : ""}
          </p>

          {bookings.map((booking) => {
            const style = getStatusStyle(booking.status);
            const isSelected = selectedBooking?.id === booking.id;

            return (
              <button
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`w-full text-left rounded-2xl border bg-white p-5 transition-shadow hover:shadow-sm ${
                  isSelected
                    ? "ring-2 ring-blue-100 border-blue-300"
                    : "border-gray-200"
                }`}
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-shrink-0">{getCategoryIcon(booking.category)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{booking.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.id}</p>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold flex-shrink-0 ${style.bg} ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {booking.statusText}
                  </span>
                </div>

                {/* Card Meta */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{booking.date}</span>
                  <span className="text-slate-300">·</span>
                  <span>{booking.time}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500 truncate">{booking.location}</div>
              </button>
            );
          })}
        </div>

        {/* Right Pane — Booking Detail */}
        {selectedBooking ? (
          <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow overflow-y-auto">
            {/* Detail Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{getCategoryIcon(selectedBooking.category)}</div>
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">{selectedBooking.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedBooking.id}</p>
                </div>
              </div>

              {/* Live Indicator + Status Badge */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedBooking.status === "In Progress" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                )}
                <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusStyle(selectedBooking.status).bg} ${getStatusStyle(selectedBooking.status).text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(selectedBooking.status).dot}`} />
                  {selectedBooking.statusText}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">Progress</p>
              <div className="relative">
                {/* Track bar */}
                <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-gray-100 rounded-full" />
                <div
                  className={`absolute top-3.5 left-0 h-0.5 rounded-full transition-all duration-500 ${getStatusStyle(selectedBooking.status).bar}`}
                  style={{ width: `${(selectedBooking.currentStep / (timelineSteps.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {timelineSteps.map((step, index) => {
                    const isActive = index === selectedBooking.currentStep;
                    const isCompleted = index < selectedBooking.currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / timelineSteps.length}%` }}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                          isCompleted
                            ? "bg-blue-600 border-blue-600"
                            : isActive
                            ? "bg-white border-blue-600 ring-4 ring-blue-50"
                            : "bg-white border-gray-200"
                        }`}>
                          {isCompleted ? (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : isActive ? (
                            <span className={`w-2.5 h-2.5 rounded-full ${getStatusStyle(selectedBooking.status).dot}`} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-200" />
                          )}
                        </div>
                        <p className={`text-center leading-tight ${
                          isActive
                            ? "text-sm font-semibold text-blue-600"
                            : isCompleted
                            ? "text-sm font-medium text-slate-700"
                            : "text-sm font-medium text-slate-400"
                        }`} style={{ fontSize: "11px" }}>
                          {step}
                        </p>
                        {isActive && (
                          <p className="text-sm text-slate-500 mt-0.5 text-center leading-snug" style={{ fontSize: "10px" }}>
                            {selectedBooking.eta}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Scheduled Date</p>
                <p className="text-sm text-slate-700">{selectedBooking.date}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Scheduled Time</p>
                <p className="text-sm text-slate-700">{selectedBooking.time}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Location</p>
                <p className="text-sm text-slate-700">{selectedBooking.location}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Issue Description</p>
              <p className="text-sm text-slate-600">{selectedBooking.description}</p>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Notes for Technician</p>
              <p className="text-sm text-slate-600">{selectedBooking.notes}</p>
            </div>

            {/* Technician Card */}
            {selectedBooking.technician && (
              <div className="mb-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Assigned Technician</p>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">{selectedBooking.technician.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{selectedBooking.technician.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedBooking.technician.phone}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <StarIcon />
                    <span className="text-sm font-semibold text-slate-700">{selectedBooking.technician.rating}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleReschedule(selectedBooking.id)}
                className="rounded-lg border border-gray-200 bg-white text-slate-600 text-xs font-semibold px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Reschedule
              </button>
              <button
                onClick={() => handleEmergencyOverride(selectedBooking.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                Emergency Override
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 flex items-center justify-center">
            <p className="text-sm text-slate-500">Select a booking to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
