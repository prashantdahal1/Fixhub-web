"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "../../../../contexts/AuthContext";
import { apiFetch } from "../../../../lib/api/client";
import { API } from "../../../../lib/api/endpoints";
import { BACKEND_URL } from "../../../../lib/backend-url";
import { downloadReceiptPdf } from "../../../../lib/receipt-pdf";
import { evaluatePromoCode } from "../../../../lib/promo-codes";

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
  professionalId?: any;
}

const PRICE_UNIT_LABEL: Record<PriceUnit, string> = {
  flat: "flat rate",
  per_hour: "per hour",
  per_sqft: "per sqft",
};



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
    <div className="w-full animate-pulse space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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
  const { user } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Booking Flow Controls
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1 = Select Date/Time, 2 = Finalize Order

  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Form Inputs
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateStr());
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "khalti" | "cod">("esewa");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Saved Addresses (persisted in localStorage)
  const [savedAddresses, setSavedAddresses] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("savedAddresses") || "[]");
    } catch {
      return [];
    }
  });

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const todayDate = new Date();
  const isCurrentOrPastMonth =
    currentYear < todayDate.getFullYear() ||
    (currentYear === todayDate.getFullYear() && currentMonth <= todayDate.getMonth());

  const [reviews, setReviews] = useState<Array<{
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    customerId?: { firstName?: string; lastName?: string; profilePicture?: string } | string;
  }>>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const TIME_SLOTS = [
    "08:00 AM", "09:30 AM", "11:00 AM", "01:30 PM",
    "02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"
  ];

  const TIME_WINDOWS: Record<string, string> = {
    "08:00 AM": "08:00 AM - 09:30 AM",
    "09:30 AM": "09:30 AM - 11:00 AM",
    "11:00 AM": "11:00 AM - 12:30 PM",
    "01:30 PM": "01:30 PM - 03:00 PM",
    "02:00 PM": "02:00 PM - 03:30 PM",
    "03:30 PM": "03:30 PM - 05:00 PM",
    "05:00 PM": "05:00 PM - 06:30 PM",
    "06:30 PM": "06:30 PM - 08:00 PM",
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/services/slug/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setService(json.data);
          try {
            const rev = await apiFetch<{ data: any[] }>(API.REVIEWS.BY_SERVICE(json.data._id));
            setReviews(rev.data || []);
          } catch {
            setReviews([]);
          }
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

  useEffect(() => {
    if (!service?._id || typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const backendUrl = new URL(BACKEND_URL);
    const protocol = backendUrl.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = backendUrl.host;
    const wsUrl = `${protocol}//${wsHost}/ws?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => setSocketConnected(true));
    socket.addEventListener("message", (event) => {
      try {
        const envelope = JSON.parse(event.data);
        if (!envelope || envelope.type !== "review_created") return;
        const payload = envelope.payload as any;
        if (!payload || payload.serviceId !== service._id) return;

        if (payload.review) {
          setReviews((prev) => [payload.review, ...prev]);
        }
        setService((prev) =>
          prev
            ? {
                ...prev,
                rating: payload.rating ?? prev.rating,
                reviewCount: payload.reviewCount ?? prev.reviewCount,
              }
            : prev
        );
      } catch {
        // ignore malformed websocket messages
      }
    });
    socket.addEventListener("close", () => setSocketConnected(false));
    socket.addEventListener("error", () => setSocketConnected(false));

    return () => {
      socket.close();
    };
  }, [service?._id]);

  // Calendar Helpers
  const handlePrevMonth = () => {
    if (isCurrentOrPastMonth) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon = 0, Sun = 6
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
    const daysGrid = [];

    for (let i = 0; i < firstDayIndex; i++) {
      daysGrid.push(<div key={`empty-${i}`} className="h-10" />);
    }

    const todayStr = getTodayDateStr();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isSelected = selectedDate === dateStr;
      const isPast = dateStr < todayStr;

      daysGrid.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPast}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-10 w-10 flex items-center justify-center rounded-xl text-xs font-semibold transition-all ${
            isPast
              ? "text-slate-300 bg-slate-50 cursor-not-allowed opacity-50"
              : isSelected
                ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] ring-2 ring-blue-600 ring-offset-2 scale-105"
                : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return daysGrid;
  };

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const mapTimeTo24h = (time12h: string) => {
    if (time12h === "08:00 AM") return "08:00";
    if (time12h === "09:30 AM") return "09:30";
    if (time12h === "11:00 AM") return "11:00";
    if (time12h === "01:30 PM") return "13:30";
    if (time12h === "02:00 PM") return "14:00";
    if (time12h === "03:30 PM") return "15:30";
    if (time12h === "05:00 PM") return "17:00";
    if (time12h === "06:30 PM") return "18:30";
    return "12:00";
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !service) return;
    if (!address.trim()) {
      setBookingError("Address is required");
      return;
    }
    setBookingLoading(true);
    setBookingError(""); // always clear previous errors on a fresh attempt
    try {
      const time24 = mapTimeTo24h(selectedTime);
      const scheduledAt = new Date(`${selectedDate}T${time24}:00`);

      const payload = {
        serviceId: service._id,
        scheduledAt: scheduledAt.toISOString(),
        address: address.trim(),
        notes: notes.trim() || undefined,
        paymentProvider,
        promoCode: appliedPromo || undefined,
      };

      const res = await apiFetch<{
        data: {
          payment: {
            provider: 'esewa' | 'khalti' | 'cod';
            paymentUrl?: string;
            redirectUrl?: string;
            formData?: Record<string, string>;
          };
        };
      }>(API.BOOKINGS.CREATE, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const { provider, paymentUrl, redirectUrl, formData } = res.data.payment;

      if (provider === 'cod' && redirectUrl) {
        window.location.href = redirectUrl;
        return; // page will navigate away
      } else if (provider === 'esewa' && formData && paymentUrl) {
        // eSewa requires a POST form redirect
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentUrl;
        Object.entries(formData).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = val;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return; // page will navigate away
      } else if (provider === 'khalti' && paymentUrl) {
        window.location.href = paymentUrl;
        return; // page will navigate away
      } else {
        throw new Error("Invalid payment response from server");
      }
    } catch (err: any) {
      setBookingError(err.message || "Booking failed");
      toast.error(err.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="w-full px-4 py-6 sm:px-6 lg:px-8"><DetailSkeleton /></div>;

  if (notFound || !service) {
    return (
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 text-center py-20">
        <p className="text-slate-400 text-sm">Service not found.</p>
        <button onClick={() => router.back()} className="mt-3 text-xs font-semibold text-blue-600 hover:underline">
          ← Back to Services
        </button>
      </div>
    );
  }

  // Invoice Breakdown Calculations based on service.basePrice
  const totalAmount = service.basePrice;
  const effectiveAmount = Math.max(0, totalAmount - appliedDiscount);
  const subtotal = Math.round((effectiveAmount / 1.13) * 100) / 100;
  const surcharge = Math.min(150, Math.round(subtotal * 0.08 * 100) / 100);
  const componentParts = Math.round(subtotal * 0.22 * 100) / 100;
  const baseServiceFee = Math.round((subtotal - surcharge - componentParts) * 100) / 100;
  const tax = Math.round((subtotal * 0.13) * 100) / 100;

  const proObj = typeof service.professionalId === "object" && service.professionalId !== null ? (service.professionalId as any) : null;
  const activeExpertName = proObj
    ? `${proObj.firstName || ""} ${proObj.lastName || ""}`.trim() || "FixHub Certified Pro"
    : "FixHub Certified Pro";
  const activeExpertImage = proObj?.profilePicture || "";
  const activeExpertRating = proObj?.averageRating || service.rating || 4.8;
  const activeExpertBadge = proObj ? "FixHub Verified Pro" : "Master Certified";

  // Download the pre-payment invoice (UNPAID) for the order being finalised.
  const downloadInvoicePdf = async () => {
    if (!selectedDate || !selectedTime || !service) return;
    const time24 = mapTimeTo24h(selectedTime);
    const scheduledAt = new Date(`${selectedDate}T${time24}:00`).toISOString();
    const fullName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email
      : "FixHub Customer";

    const isCod = paymentProvider === "cod";
    const derivedAmount = effectiveAmount + (isCod ? 10 : 0);

    const lineItems = [
      { description: `${service.title} (Base Fee)`, quantity: 1, unitPrice: baseServiceFee, amount: baseServiceFee },
      { description: "Component Parts & Materials", quantity: 1, unitPrice: componentParts, amount: componentParts },
      { description: "Asset & Logistics Surcharge", quantity: 1, unitPrice: surcharge, amount: surcharge },
    ];

    if (appliedDiscount > 0) {
      lineItems.push({
        description: `Promo Discount (${appliedPromo})`,
        quantity: 1,
        unitPrice: -appliedDiscount,
        amount: -appliedDiscount,
      });
    }

    if (isCod) {
      lineItems.push({
        description: "COD Cash Surcharge",
        quantity: 1,
        unitPrice: 10,
        amount: 10,
      });
    }

    await downloadReceiptPdf({
      kind: "invoice",
      orderNumber: service._id.slice(-8).toUpperCase(),
      orderId: service._id,
      invoiceNumber: `INV-${service._id.slice(-8).toUpperCase()}`,
      service: service.title,
      status: "pending",
      escrowStatus: "not_held",
      amount: derivedAmount,
      scheduledAt,
      address: address.trim() || "To be confirmed",
      customer: fullName,
      customerEmail: user?.email,
      customerPhone: user?.phoneNumber,
      professional: activeExpertName,
      notes: notes.trim() || undefined,
      paymentProvider: paymentProvider === "esewa" ? "eSewa" : paymentProvider === "khalti" ? "Khalti" : "Cash on Delivery",
      lineItems,
    });
    toast.success("Invoice downloaded.");
  };

  // Render Service Detail Page (Standard Mode)
  if (!isBookingMode) {
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
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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

              {service.professionalId && (
                <>
                  <section className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">About the Professional</h2>
                    <div className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                      {service.professionalId.profilePicture ? (
                        <img src={service.professionalId.profilePicture} alt="Professional" className="w-16 h-16 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl shadow-sm">
                          {service.professionalId.firstName?.[0] || ""}{service.professionalId.lastName?.[0] || ""}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {service.professionalId.firstName} {service.professionalId.lastName}
                        </h3>
                        <p className="text-[13px] text-slate-500 mb-1">
                          FixHub Certified {service.category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} Professional
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={service.professionalId.averageRating || 5} size={12} />
                          <span className="text-[11px] font-bold text-slate-700">{service.professionalId.averageRating?.toFixed(1) || "5.0"}</span>
                          <span className="text-[11px] text-slate-400">({service.professionalId.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <div className="w-full h-px bg-slate-100" />
                </>
              )}

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
                  {reviews.length === 0 ? (
                    <p className="text-sm text-slate-400">No reviews yet.</p>
                  ) : reviews.map((review) => {
                    const name = typeof review.customerId === "object" && review.customerId
                      ? `${review.customerId.firstName || ""} ${review.customerId.lastName || ""}`.trim()
                      : "Customer";
                    return (
                    <div key={review._id} className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-xs font-bold text-blue-700">
                            {(name || "C")[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{name || "Customer"}</p>
                            <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed">{review.comment || "No comment."}</p>
                    </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* ── RIGHT COLUMN: QUICK BOOK CARD ─────────────────── */}
          <div className="lg:sticky lg:top-[88px]">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Starting from</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  रू {service.basePrice.toLocaleString()}
                  <span className="text-sm font-medium text-slate-400 ml-1.5">{PRICE_UNIT_LABEL[service.priceUnit]}</span>
                </p>
                <div className="flex items-center gap-2 mt-3 bg-white px-3 py-2 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Estimated duration: {service.estimatedDuration}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Schedule your professional service with Nepali leading marketplace. Quick checkout with credit cards, eSewa, Khalti, or Cash on Delivery instantly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsBookingMode(true)}
                  className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                >
                  Book This Service
                </button>
              </div>
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
      </div>
    );
  }

  // ── WIZARD MODE: STEP 1 (Select Date / Appointment Confirmation) ──
  if (bookingStep === 1) {
    return (
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Go Back */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Service Order &gt; Select Date
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Select Date</h1>
          </div>
          <button
            onClick={() => setIsBookingMode(false)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel Booking
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Calendar Picker Block */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                  <p className="text-xs text-slate-400">Select an available date for your inspection</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    disabled={isCurrentOrPastMonth}
                    type="button"
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={handleNextMonth}
                    type="button"
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-y-3 justify-items-center">
                {renderCalendarDays()}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Available Time Slots</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs: Address & Notes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Service Logistics</h3>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Service Address</label>
                <select
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm border-0 ring-1 ring-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-slate-50/50 hover:bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                >
                  <option value="">Select saved address</option>
                  {savedAddresses.map((addr, idx) => (
                    <option key={idx} value={addr}>{addr}</option>
                  ))}
                  <option value="__addnew__">+ Add New Address</option>
                </select>
                {address === "__addnew__" && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter new address"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const newAddr = e.currentTarget.value.trim();
                          if (newAddr) {
                            const updated = [...savedAddresses, newAddr];
                            setSavedAddresses(updated);
                            localStorage.setItem("savedAddresses", JSON.stringify(updated));
                            setAddress(newAddr);
                          }
                        }
                      }}
                      className="flex-1 text-sm border-0 ring-1 ring-slate-200 rounded-xl px-4 py-2 text-slate-800 bg-slate-50/50 hover:bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Enter new address"]') as HTMLInputElement;
                        const newAddr = input?.value.trim();
                        if (newAddr) {
                          const updated = [...savedAddresses, newAddr];
                          setSavedAddresses(updated);
                          localStorage.setItem("savedAddresses", JSON.stringify(updated));
                          setAddress(newAddr);
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                    >Add</button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Describe your issue or any special requirements..."
                  className="w-full text-sm border-0 ring-1 ring-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-slate-50/50 hover:bg-slate-50 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Summary column */}
          <div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={service.imageUrl || "/images/placeholder.jpg"}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-400">PREMIUM SERVICE</span>
                  <h4 className="font-extrabold text-base leading-tight mt-1">{service.title}</h4>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Assigned Expert */}
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                  {activeExpertImage ? (
                    <img
                      src={activeExpertImage}
                      alt={activeExpertName}
                      className="w-10 h-10 rounded-full object-cover shadow-sm border border-white"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-inner uppercase">
                      {activeExpertName.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ASSIGNED EXPERT</p>
                    <p className="text-xs font-bold text-slate-800">{activeExpertName}</p>
                    <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                      ⭐ {activeExpertRating} <span className="text-slate-400 font-medium">({activeExpertBadge})</span>
                    </p>
                  </div>
                </div>

                {/* Booking details summary */}
                <div className="space-y-3 text-xs border-b border-slate-100 pb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Date</span>
                    <span className="text-slate-700 font-bold">
                      {selectedDate ? getFormattedDate(selectedDate) : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Time Window</span>
                    <span className="text-slate-700 font-bold">
                      {selectedTime ? TIME_WINDOWS[selectedTime] : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Subtotal</span>
                    <span className="text-slate-700 font-bold">रू {totalAmount.toLocaleString()}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>Promo Discount ({appliedPromo})</span>
                      <span>- रू {appliedDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {promoMessage && !appliedDiscount && (
                    <div className="text-xs text-slate-500">{promoMessage}</div>
                  )}
                </div>

                {/* Promo Code Input Block matching Reference Screenshot 3 */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promo Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. FIXHUB30)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase tracking-wider font-semibold"
                    />
                                    <button
                      type="button"
                      onClick={() => {
                        const promo = promoInput.trim();
                        const result = evaluatePromoCode(promo, {
                          basePrice: service.basePrice,
                          category: service.category,
                        }, user);

                        if (!result.valid) {
                          setAppliedPromo("");
                          setAppliedDiscount(0);
                          setPromoMessage(result.message);
                          toast.error(result.message);
                          return;
                        }

                        setAppliedPromo(result.normalizedCode || promo.toUpperCase());
                        setAppliedDiscount(result.discount);
                        setPromoMessage(result.message);
                        toast.success(result.message);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold text-blue-600">रू {Math.max(0, totalAmount - appliedDiscount).toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  disabled={!selectedDate || !selectedTime || !address.trim()}
                  onClick={() => setBookingStep(2)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  CONFIRM APPOINTMENT
                  <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                <p className="text-[10px] text-slate-400 text-center font-medium">
                  24h Cancellation Policy Applies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── WIZARD MODE: STEP 2 (Finalize Order & Payment Method) ──
  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Service Order &gt; Secure Checkout
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Select Payment Method</h1>
        </div>
        <button
          onClick={() => setBookingStep(1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          &larr; Back to Calendar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Payment Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Service summary strip */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0">
              <img
                src={service.imageUrl || "/images/placeholder.jpg"}
                alt={service.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{service.title}</p>
              <p className="text-[10px] text-slate-400">#{service._id.slice(-6).toUpperCase()} · {selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""} · {selectedTime}</p>
            </div>
            <span className="font-extrabold text-slate-900 text-sm shrink-0">रू {totalAmount.toLocaleString()}</span>
          </div>

          {/* Payment Method Cards */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 border-b border-slate-100">
              {/* eSewa */}
              <button
                type="button"
                onClick={() => setPaymentProvider("esewa")}
                className={`flex flex-col items-center gap-2 py-6 px-4 transition-all relative ${
                  paymentProvider === "esewa"
                    ? "bg-white"
                    : "bg-slate-50 opacity-70 hover:opacity-90"
                }`}
              >
                {paymentProvider === "esewa" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
                <div className="w-20 h-10 flex items-center justify-center">
                  <img src="/images/eSewa.png" alt="eSewa" className="h-8 object-contain" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-xs">eSewa</p>
                  <p className="text-[10px] text-slate-400">eSewa Mobile Wallet</p>
                </div>
              </button>

              {/* Khalti */}
              <button
                type="button"
                onClick={() => setPaymentProvider("khalti")}
                className={`flex flex-col items-center gap-2 py-6 px-4 transition-all relative border-l border-slate-100 ${
                  paymentProvider === "khalti"
                    ? "bg-white"
                    : "bg-slate-50 opacity-70 hover:opacity-90"
                }`}
              >
                {paymentProvider === "khalti" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
                <div className="w-20 h-10 flex items-center justify-center">
                  <img src="/images/khalti.png" alt="Khalti by IME" className="h-8 object-contain" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-xs">Khalti by IME</p>
                  <p className="text-[10px] text-slate-400">Mobile Wallet</p>
                </div>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentProvider("cod")}
                className={`flex flex-col items-center gap-2 py-6 px-4 transition-all relative border-l border-slate-100 ${
                  paymentProvider === "cod"
                    ? "bg-white"
                    : "bg-slate-50 opacity-70 hover:opacity-90"
                }`}
              >
                {paymentProvider === "cod" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
                <div className="w-20 h-10 flex items-center justify-center text-blue-600">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-xs">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-400">Pay after service</p>
                </div>
              </button>
            </div>

            {/* Instructions panel */}
            <div className="p-6 space-y-4">
              {paymentProvider === "cod" && (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-2.5 items-center mb-2">
                    <span className="text-xs text-blue-800 font-medium">
                      ℹ️ An additional COD surcharge of <strong>रू 10</strong> will be applied to this booking.
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    &quot;You have selected Cash on Delivery. Here's what to expect:
                  </p>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li>1. Your booking will be instantly confirmed.</li>
                    <li>2. The professional will arrive at the scheduled time.</li>
                    <li>3. Pay the professional in cash (or direct transfer) after the service is completed.&quot;</li>
                  </ol>
                </>
              )}
              {paymentProvider === "esewa" && (
                <>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    &quot;You will be redirected to eSewa to complete your payment:
                  </p>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li>1. Login to your eSewa account using your eSewa ID and password.</li>
                    <li>2. Ensure your eSewa account has sufficient balance.</li>
                    <li>3. Confirm the payment on the eSewa portal.&quot;</li>
                  </ol>
                </>
              )}
              {paymentProvider === "khalti" && (
                <>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    &quot;You will be redirected to your Khalti account to complete the payment:
                  </p>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li>1. Login using your Khalti ID and Password/MPIN.</li>
                    <li>2. Enter OTP sent to your mobile number.</li>
                    <li>3. Confirm the transaction to complete booking.&quot;</li>
                  </ol>
                </>
              )}

              {bookingError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-rose-600 font-semibold">
                    ⚠️ {bookingError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingError("");
                      setBookingStep(1);
                      setSelectedDate("");
                      setSelectedTime("");
                    }}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-700 underline underline-offset-2"
                  >
                    ← Pick a different date &amp; time to try again
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={bookingLoading}
                onClick={handleBooking}
                className={`w-full py-4 rounded-xl text-sm font-extrabold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                  paymentProvider === "cod"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200 disabled:bg-blue-300"
                    : paymentProvider === "esewa"
                      ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 disabled:bg-emerald-300"
                      : "bg-red-600 hover:bg-red-700 shadow-red-200 disabled:bg-red-300"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    {paymentProvider === "cod" ? "Confirming..." : "Redirecting..."}
                  </>
                ) : (
                  paymentProvider === "cod" ? "Confirm Booking" : "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right side invoices and checkout summary */}
        <div className="space-y-6">
          {/* Invoice Summary Card */}
          <div className="rounded-3xl p-6 shadow-xl text-white space-y-6 bg-gradient-to-br from-blue-600 to-blue-800">
            <h3 className="font-extrabold text-base tracking-tight">Invoice Summary</h3>

            <div className="space-y-3.5 text-xs border-b border-white/20 pb-5">
              <div className="flex justify-between items-center opacity-90">
                <span>Base Service Fee</span>
                <span className="font-bold">रू {baseServiceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span>Component Parts</span>
                <span className="font-bold">रू {componentParts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span>Asset Management Surcharge</span>
                <span className="font-bold">रू {surcharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span>Tax (VAT 13%)</span>
                <span className="font-bold">रू {tax.toFixed(2)}</span>
              </div>
              {paymentProvider === "cod" && (
                <div className="flex justify-between items-center text-amber-300 font-bold">
                  <span>COD Cash Surcharge</span>
                  <span>रू 10.00</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">TOTAL AMOUNT DUE</span>
              <span className="text-xl font-black">रू {(effectiveAmount + (paymentProvider === "cod" ? 10 : 0)).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-white/70 pt-1">
              <span className="flex items-center gap-1">🔒 SSL SECURED</span>
              <span className="flex items-center gap-1">✅ PCI-DSS COMPLIANT</span>
            </div>
          </div>

          {/* Digital Receipt mock card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">DIGITAL RECEIPT</h4>
              <button
                type="button"
                onClick={downloadInvoicePdf}
                disabled={!selectedDate || !selectedTime}
                aria-label="Download invoice PDF"
                className="text-slate-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>

            <div className="flex items-center gap-2.5 py-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div>
                <span className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1">
                  Fix<span className="text-blue-600">Hub</span>
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Auto-generated PDF will be sent to primary email upon successful transaction
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadInvoicePdf}
              disabled={!selectedDate || !selectedTime}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Invoice PDF
            </button>
          </div>
        </div>
      </div>

      {/* Premium Success Modal */}
      {bookingSubmitted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
        >
          <div className="bg-white rounded-3xl w-full max-w-[420px] mx-4 overflow-hidden shadow-2xl">
            <div className="relative pt-8 pb-6 px-6 text-center border-b border-slate-100 bg-emerald-50/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white flex items-center justify-center mx-auto mb-4 shadow-[0_8px_16px_-6px_rgba(16,185,129,0.5)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment Confirmed!</h3>
              <p className="text-[13px] text-slate-500 mt-1.5 font-medium">Your service booking and payment are successfully finalized.</p>
            </div>

            <div className="px-6 py-6 bg-slate-50/50 space-y-3">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">SERVICE</span>
                  <span className="text-slate-800 font-bold">{service.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">DATE</span>
                  <span className="text-slate-800 font-bold">{getFormattedDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">TIME</span>
                  <span className="text-slate-800 font-bold">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">EXPERT</span>
                  <span className="text-slate-800 font-bold">{activeExpertName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                  <span className="text-slate-600">AMOUNT PAID</span>
                  <span className="text-blue-600">रू {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 bg-white flex flex-col gap-2.5">
              <button
                onClick={() => router.push("/dashboard/bookings")}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 group"
              >
                Track Booking Status
                <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
