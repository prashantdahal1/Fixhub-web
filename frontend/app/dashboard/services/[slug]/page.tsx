"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type PriceUnit = "flat" | "per_hour" | "per_sqft";
type ServiceCategory =
  | "electrician" | "plumber" | "ac_repair" | "painter"
  | "carpenter" | "cleaner" | "geyser" | "appliance_repair"
  | "pest_control" | "other";

interface Specification { label: string; value: string }

interface Service {
  _id: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  shortDescription: string;
  basePrice: number;
  priceUnit: PriceUnit;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  tags: string[];
  specifications: Specification[];
  isCertified: boolean;
  estimatedDuration: string;
}

const PRICE_UNIT_LABEL: Record<PriceUnit, string> = {
  flat: "flat rate",
  per_hour: "per hour",
  per_sqft: "per sqft",
};

const MOCK_REVIEWS = [
  { id: 1, name: "Rajan Shrestha", rating: 5, date: "Jun 2026", text: "Excellent work. The technician arrived on time and fixed the issue within an hour. Very professional." },
  { id: 2, name: "Sunita Gurung", rating: 4, date: "May 2026", text: "Good service overall. Minor delay but the quality of work was great." },
  { id: 3, name: "Bikash Karki", rating: 5, date: "May 2026", text: "FixHub Certified professionals really do deliver. Highly recommended." },
];

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= Math.round(rating) ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.75">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-5xl animate-pulse space-y-6">
      <div className="h-6 bg-slate-100 rounded w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-56 bg-slate-100 rounded-2xl" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-5/6" />
          <div className="h-4 bg-slate-100 rounded w-4/6" />
        </div>
        <div className="h-72 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/services/slug/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setService(json.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setBookingLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setBookingLoading(false);
    setBookingSubmitted(true);
  };

  if (loading) return <div className="max-w-5xl"><DetailSkeleton /></div>;

  if (notFound || !service) {
    return (
      <div className="max-w-5xl text-center py-20">
        <p className="text-slate-400 text-sm">Service not found.</p>
        <button onClick={() => router.back()} className="mt-3 text-xs font-semibold text-blue-600 hover:underline">
          ← Back to Services
        </button>
      </div>
    );
  }

  const fallbackGradients: Record<ServiceCategory, string> = {
    electrician: "linear-gradient(135deg,#1e3a8a,#2563eb)",
    plumber: "linear-gradient(135deg,#164e63,#0891b2)",
    ac_repair: "linear-gradient(135deg,#134e4a,#0d9488)",
    painter: "linear-gradient(135deg,#4c1d95,#7c3aed)",
    carpenter: "linear-gradient(135deg,#78350f,#d97706)",
    cleaner: "linear-gradient(135deg,#065f46,#10b981)",
    geyser: "linear-gradient(135deg,#7f1d1d,#ef4444)",
    appliance_repair: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
    pest_control: "linear-gradient(135deg,#365314,#65a30d)",
    other: "linear-gradient(135deg,#374151,#6b7280)",
  };

  return (
    <div className="max-w-5xl space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Services
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          <div
            className="h-[320px] rounded-3xl flex items-end p-8 relative overflow-hidden shadow-sm"
            style={{
              background: service.imageUrl
                ? `url(${service.imageUrl}) center/cover no-repeat`
                : fallbackGradients[service.category],
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                {service.isCertified && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md text-[11px] font-bold text-white px-3 py-1 rounded-full shadow-sm">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    FixHub Certified
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-[11px] font-bold text-white px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                  {service.category.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">{service.title}</h1>
              <div className="flex items-center gap-2.5">
                <StarRating rating={service.rating} size={14} />
                <span className="text-sm font-medium text-white/90">{service.rating.toFixed(1)}</span>
                <span className="text-sm text-white/60">({service.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-2">
            {/* About Section */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">About This Service</h2>
              <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
                {service.description || service.shortDescription}
              </p>
              {service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <div className="w-full h-px bg-slate-100" />

            {/* Specifications Section */}
            {service.specifications.length > 0 && (
              <>
                <section className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Service Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.specifications.map((spec, i) => (
                      <div key={i} className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">{spec.label}</span>
                        <span className="text-sm text-slate-800 font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <div className="w-full h-px bg-slate-100" />
              </>
            )}

            {/* Reviews Section */}
            <section className="space-y-5">
              <div className="flex items-end justify-between">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Customer Reviews</h2>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={service.rating} size={14} />
                  <span className="text-sm font-bold text-slate-900">{service.rating.toFixed(1)}</span>
                  <span className="text-sm text-slate-400">/ 5</span>
                </div>
              </div>
              <div className="grid gap-4">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-xs font-bold text-blue-700">
                          {review.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{review.name}</p>
                          <p className="text-[10px] text-slate-400">{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-[12px] text-slate-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── RIGHT COLUMN: STICKY BOOKING BOX ─────────────────── */}
        <div className="lg:sticky lg:top-[88px]">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Starting from</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Rs {service.basePrice.toLocaleString()}
                <span className="text-sm font-medium text-slate-400 ml-1.5">{PRICE_UNIT_LABEL[service.priceUnit]}</span>
              </p>
              <div className="flex items-center gap-2 mt-3 bg-white px-3 py-2 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Estimated duration: {service.estimatedDuration}
              </div>
            </div>

            <form onSubmit={handleBooking} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Select Date</label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full text-sm border-0 ring-1 ring-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Preferred Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    className="w-full text-sm border-0 ring-1 ring-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm appearance-none"
                  >
                    <option value="">Choose a time slot</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Additional Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Describe your issue or any special requirements..."
                    className="w-full text-sm border-0 ring-1 ring-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-slate-50/50 hover:bg-slate-50 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !selectedDate || !selectedTime}
                  className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                >
                  {bookingLoading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Confirming...
                    </>
                  ) : (
                    "Book This Service"
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center font-medium">
                  Free cancellation up to 2 hours before.
                </p>
              </form>
          </div>

          <div className="mt-3 bg-[#EFF6FF] border border-blue-100 rounded-xl p-3.5 flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-full bg-white border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <p className="text-[10.5px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">100% Satisfaction Guaranteed.</span> All professionals are background-verified and FixHub Certified.
            </p>
          </div>
        </div>
      </div>

      {/* Premium Booking Confirmation Modal */}
      {bookingSubmitted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setBookingSubmitted(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-[420px] mx-4 overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with gradient pattern */}
            <div className="relative pt-8 pb-6 px-6 text-center border-b border-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 to-white">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setBookingSubmitted(false)}
                  className="w-8 h-8 rounded-full bg-slate-100/50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white flex items-center justify-center mx-auto mb-4 shadow-[0_8px_16px_-6px_rgba(16,185,129,0.5)] transform -rotate-3 hover:rotate-0 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Booking Confirmed!</h3>
              <p className="text-[13px] text-slate-500 mt-1.5 font-medium">Your request has been successfully processed.</p>
            </div>

            {/* Booking Details Card */}
            <div className="px-6 py-6 bg-slate-50/50">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between pb-3 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Service</p>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{service.title}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Date</p>
                    <p className="text-[13px] font-semibold text-slate-700">
                      {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ""}
                    </p>
                  </div>
                  <div className="w-px bg-slate-100" />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Time</p>
                    <p className="text-[13px] font-semibold text-slate-700">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 bg-emerald-50/80 border border-emerald-100 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium leading-tight">
                  <span className="font-bold">Verified Professional</span> will be assigned shortly.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 bg-white flex flex-col gap-2.5">
              <button
                onClick={() => router.push("/dashboard/bookings")}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[13px] font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 group"
              >
                Track Booking Status
                <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button
                onClick={() => {
                  setBookingSubmitted(false);
                  setSelectedDate("");
                  setSelectedTime("");
                  setNotes("");
                }}
                className="w-full py-3 bg-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-[13px] font-bold rounded-xl transition-colors"
              >
                Book Another Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
