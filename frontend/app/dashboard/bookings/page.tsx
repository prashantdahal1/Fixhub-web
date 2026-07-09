"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Booking {
  id: string;
  category: "Electrician" | "Plumber" | "Painter" | "Carpenter" | "AC Repair";
  title: string;
  status: "In Progress" | "Technician Dispatched" | "Awaiting Parts" | "Scheduled";
  statusText: string;
  technician: {
    name: string;
    phone: string;
    rating: number;
    initials: string;
  } | null;
  date: string;
  time: string;
  eta: string;
  location: string;
  description: string;
  notes: string;
  currentStep: number; // 0-4
}

// ─── Icons ──────────────────────────────────────────────────────────────────────
const BoltIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(37,99,235,0.08)" />
  </svg>
);
const WrenchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const PaintIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="8" rx="2" fill="rgba(37,99,235,0.08)" />
    <path d="M5 11v4" />
    <rect x="3" y="15" width="4" height="5" rx="1" fill="rgba(37,99,235,0.08)" />
    <line x1="17" y1="7" x2="21" y2="7" />
  </svg>
);
const HammerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
    <path d="M17.64 15L22 10.64" />
    <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.75l-2.25-2.25H14l-.34.34-.75-.75-.34.34L9 6.5l.75.75L9 8l1.5 1.5 1.5-1.5 3 3z" />
  </svg>
);
const ACIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="9" rx="2" fill="rgba(37,99,235,0.08)" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 19c0-2 2-4 6-4s6 2 6 4" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── Mock Bookings ─────────────────────────────────────────────────────────────
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "FH-2026-0941",
    category: "AC Repair",
    title: "AC Deep Clean & Performance Service",
    status: "In Progress",
    statusText: "In Progress",
    technician: {
      name: "Rohan Shrestha",
      phone: "+977 9851012345",
      rating: 4.8,
      initials: "RS"
    },
    date: "July 09, 2026",
    time: "02:30 PM",
    eta: "Currently performing deep clean - 15 mins left",
    location: "Bakhundole, Lalitpur",
    description: "Indoor unit is leaking water and the airflow is significantly blocked by dust. Needs deep clean and check on refrigerant levels.",
    notes: "Please call 5 minutes before arriving. Resident is at home.",
    currentStep: 3
  },
  {
    id: "FH-2026-0942",
    category: "Plumber",
    title: "Water Tank Outlet Pipe Leak Repair",
    status: "Technician Dispatched",
    statusText: "Technician Dispatched",
    technician: {
      name: "Suman Maharjan",
      phone: "+977 9841987654",
      rating: 4.9,
      initials: "SM"
    },
    date: "July 09, 2026",
    time: "04:00 PM",
    eta: "Arriving in 12 mins (En route via motorcycle)",
    location: "Jhamsikhel, Lalitpur",
    description: "Outlet pipe connecting the overhead water tank has a continuous hairline crack causing major water wastage.",
    notes: "Access to the rooftop is available via the external spiral staircase.",
    currentStep: 2
  },
  {
    id: "FH-2026-0943",
    category: "Electrician",
    title: "Main DB Fuse Board Replacement",
    status: "Awaiting Parts",
    statusText: "Awaiting Parts",
    technician: {
      name: "Anil Thapa",
      phone: "+977 9803123456",
      rating: 4.7,
      initials: "AT"
    },
    date: "July 10, 2026",
    time: "10:00 AM",
    eta: "Pending 63A MCB shipment delivery - Rescheduling to tomorrow morning",
    location: "Koteshwor, Kathmandu",
    description: "Legacy rewireable fuse board keeps tripping under load. Scheduled replacement with a modern MCB distribution board.",
    notes: "Power outage required for approximately 1.5 hours.",
    currentStep: 1
  },
  {
    id: "FH-2026-0944",
    category: "Carpenter",
    title: "Main Entrance Wooden Door Hinge Alignment",
    status: "Scheduled",
    statusText: "Scheduled",
    technician: null,
    date: "July 12, 2026",
    time: "11:30 AM",
    eta: "Technician matching in progress",
    location: "Sanepa, Lalitpur",
    description: "Heavy solid teakwood main door is sagging and scraping against the tile floor. Needs heavy-duty alignment hinges.",
    notes: "Requires brass-colored hinges to match existing hardware.",
    currentStep: 0
  }
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
        return { bg: "bg-blue-50/75 border border-blue-100", text: "text-[#2563EB]", bar: "bg-[#2563EB]" };
      case "Technician Dispatched":
        return { bg: "bg-amber-50/75 border border-amber-100", text: "text-amber-800", bar: "bg-amber-500" };
      case "Awaiting Parts":
        return { bg: "bg-rose-50/75 border border-rose-100", text: "text-rose-800", bar: "bg-rose-500" };
      case "Scheduled":
        return { bg: "bg-emerald-50/75 border border-emerald-100", text: "text-emerald-800", bar: "bg-emerald-500" };
      default:
        return { bg: "bg-gray-50 border border-gray-100", text: "text-gray-800", bar: "bg-gray-500" };
    }
  };

  const handleEmergencyOverride = (bookingId: string) => {
    alert(`Emergency Override Triggered for booking ${bookingId}. Operations command notified and dispatching emergency supervisor.`);
  };

  const handleReschedule = (bookingId: string) => {
    const time = prompt("Enter new preferred date/time (e.g. July 15, 03:00 PM):");
    if (time) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, date: time.split(",")[0], time: time.split(",")[1] || b.time } : b));
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, date: time.split(",")[0], time: time.split(",")[1] || prev.time } : null);
      }
    }
  };

  const timelineSteps = [
    "Booking Confirmed",
    "Technician Assigned",
    "En Route",
    "In Progress",
    "Completed"
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Active Bookings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time industrial service scheduling and monitoring panel.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-2.5 py-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ops Center Link Live</span>
        </div>
      </div>

      {/* ── Split View Container ── */}
      <div className="flex-grow flex flex-col md:flex-row gap-5 min-h-0">
        
        {/* Left Pane: Job List */}
        <div className="w-full md:w-[40%] flex flex-col space-y-3 overflow-y-auto pr-1">
          {bookings.map((b) => {
            const isSelected = selectedBooking?.id === b.id;
            const style = getStatusStyle(b.status);
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className={`relative bg-white rounded-xl border p-4 cursor-pointer transition-all duration-200 select-none shadow-sm flex flex-col gap-3 group hover:border-[#2563EB]/40 ${
                  isSelected ? "ring-2 ring-blue-100 border-[#2563EB]" : "border-gray-100"
                }`}
              >
                {/* Left color bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-xl ${style.bar}`} />

                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50/60 flex items-center justify-center shrink-0">
                      {getCategoryIcon(b.category)}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-gray-800 line-clamp-1">{b.title}</h3>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{b.id}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${style.bg} ${style.text}`}>
                    {b.statusText}
                  </span>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] border-t border-gray-50 pt-2 font-medium">
                  <div className="text-gray-500">
                    Technician: <span className="text-gray-800 font-bold">{b.technician?.name || "Assigning..."}</span>
                  </div>
                  <div className="text-gray-500 text-right">
                    Scheduled: <span className="text-gray-800 font-bold">{b.date}</span>
                  </div>
                </div>

                {/* Quick actions directly on card */}
                <div className="flex gap-2 pt-1 border-t border-gray-50 mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReschedule(b.id);
                    }}
                    className="flex-1 py-1 text-[10px] font-bold border border-gray-200 rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all text-center"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEmergencyOverride(b.id);
                    }}
                    className="flex-1 py-1 text-[10px] font-bold border border-red-200 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 active:scale-95 transition-all text-center"
                  >
                    Override
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Pane: Live Detail Panel */}
        <div className="flex-grow flex-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-y-auto flex flex-col min-h-0">
          {selectedBooking ? (
            <div className="flex-grow flex flex-col justify-between h-full space-y-4">
              
              {/* Header section */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-3 shrink-0 gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-black text-gray-900 tracking-tight">{selectedBooking.title}</h2>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getStatusStyle(selectedBooking.status).bg} ${getStatusStyle(selectedBooking.status).text}`}>
                      {selectedBooking.statusText}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">System Reference ID: {selectedBooking.id}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50/60 flex items-center justify-center shrink-0">
                  {getCategoryIcon(selectedBooking.category)}
                </div>
              </div>

              {/* Technician assigned */}
              <div className="bg-gray-50/60 rounded-xl p-3.5 border border-gray-100 shrink-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0">
                      {selectedBooking.technician?.initials || "??"}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-800">{selectedBooking.technician?.name || "Assigning Expert..."}</h4>
                      {selectedBooking.technician ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarIcon />
                          <span className="text-[10px] text-gray-600 font-bold">{selectedBooking.technician.rating} Rated Specialist</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 font-semibold">Matching nearest operations technician...</p>
                      )}
                    </div>
                  </div>
                  {selectedBooking.technician && (
                    <a
                      href={`tel:${selectedBooking.technician.phone}`}
                      className="px-3 py-1.5 text-[10px] font-black bg-white border border-gray-200 text-[#2563EB] rounded-lg shadow-sm hover:bg-blue-50 active:scale-95 transition-all"
                    >
                      Call Now
                    </a>
                  )}
                </div>
              </div>

              {/* Live Tracking Timeline */}
              <div className="flex-grow py-1">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">Operations Sequence Tracking</h3>
                <div className="relative pl-6 border-l border-gray-200 space-y-4">
                  {timelineSteps.map((stepName, index) => {
                    const isCompleted = index < selectedBooking.currentStep;
                    const isActive = index === selectedBooking.currentStep;
                    return (
                      <div key={stepName} className="relative flex items-start">
                        {/* Dot indicators */}
                        <div
                          className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? "bg-[#2563EB] border-[#2563EB] text-white"
                              : isActive
                              ? "bg-white border-[#2563EB] ring-4 ring-blue-100"
                              : "bg-white border-gray-200"
                          }`}
                          style={{ width: "18px", height: "18px" }}
                        >
                          {isCompleted && (
                            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping" />}
                        </div>

                        {/* Text */}
                        <div className="ml-1">
                          <p className={`text-xs font-black leading-none ${isActive ? "text-[#2563EB]" : "text-gray-700"}`}>
                            {stepName}
                          </p>
                          {isActive && (
                            <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                              {selectedBooking.eta}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Job Details Grid */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 shrink-0 text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Target Address</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedBooking.location}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Operational Window</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedBooking.date} at {selectedBooking.time}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Service Scope & Specs</p>
                  <p className="font-semibold text-gray-600 mt-0.5">{selectedBooking.description}</p>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Site Entry Instructions</p>
                    <p className="font-medium text-amber-700 bg-amber-50/50 border border-amber-100/60 rounded px-2 py-1 mt-0.5">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 shrink-0 flex-wrap">
                <button
                  onClick={() => handleReschedule(selectedBooking.id)}
                  className="flex-1 min-w-[120px] py-2 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-black rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-center"
                >
                  Reschedule Job
                </button>
                <button
                  onClick={() => alert("Cancellation request dispatched. Support operator will contact you shortly.")}
                  className="flex-1 min-w-[120px] py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-center"
                >
                  Cancel Booking
                </button>
                <button
                  onClick={() => handleEmergencyOverride(selectedBooking.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-lg transition-all shadow-sm shadow-red-200 text-center"
                >
                  Emergency Override
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-xs font-bold text-gray-800">No Booking Selected</h3>
              <p className="text-[10px] text-gray-500 max-w-[200px] mt-1">Select an active job from the operations board to view live coordinates and ETA sequence.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
