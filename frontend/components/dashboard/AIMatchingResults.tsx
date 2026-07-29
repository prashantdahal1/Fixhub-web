"use client";

import { useState } from "react";
import { findBestMatches, testBackend } from "@/lib/api/ai-matching";
import Link from "next/link";

interface ProfessionalMatch {
  professionalId: string;
  serviceId: string;
  serviceSlug?: string;
  professionalName: string;
  serviceName: string;
  overallScore: number;
  locationScore: number;
  ratingScore: number;
  expertiseScore: number;
  availabilityScore: number;
  priceScore: number;
  factors: {
    distance: number;
    rating: number;
    reviewCount: number;
    categoryMatch: boolean;
    availability: number;
    priceCompetitiveness: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  electrician: "Electrician",
  plumber: "Plumber",
  ac_repair: "AC Repair",
  painter: "Painter",
  carpenter: "Carpenter",
  cleaner: "Cleaning",
  geyser: "Geyser Repair",
  appliance_repair: "Appliance Repair",
  pest_control: "Pest Control",
  other: "Other",
};

const SERVICE_CATEGORIES = [
  "electrician",
  "plumber",
  "ac_repair",
  "painter",
  "carpenter",
  "cleaner",
  "geyser",
  "appliance_repair",
  "pest_control",
  "other",
];

function ScoreBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "#10B981" : value >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

function ScorePill({ value }: { value: number }) {
  const { bg, text } =
    value >= 80
      ? { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" }
      : value >= 60
      ? { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" }
      : { bg: "bg-rose-50 border-rose-200", text: "text-rose-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-sm font-bold ${bg} ${text}`}>
      {value}%
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function AIMatchingResults() {
  const [serviceCategory, setServiceCategory] = useState("");
  const [matches, setMatches] = useState<ProfessionalMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleFindMatches = async () => {
    if (!serviceCategory) {
      setError("Please select a service category");
      return;
    }

    setLoading(true);
    setError(null);
    setMatches([]);
    setSearched(false);

    try {
      // First test backend connectivity
      console.log("Testing backend connectivity...");
      await testBackend();
      console.log("Backend is reachable!");

      const customerLocation = { city: "Kathmandu", province: "Bagmati" };

      console.log("Sending AI matching request...");
      const response = await findBestMatches({
        serviceCategory,
        customerLocation,
        maxResults: 5,
      });

      console.log("AI matching response:", response);

      if (response.success && response.data?.matches) {
        setMatches(response.data.matches);
      } else {
        setError("No professionals found for this category.");
      }
    } catch (err: any) {
      console.error("Complete error:", err);
      setError(err.message || "Failed to find matches. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
      {/* ── Gradient Banner Header ── */}
      <div
        className="relative px-5 py-5 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)" }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              {/* Sparkle/AI icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(255,255,255,0.2)" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI-Powered Matching</h2>
              <p className="text-blue-200 text-[11px] mt-0.5">Find the best pro for your job</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={serviceCategory}
            onChange={(e) => { setServiceCategory(e.target.value); setError(null); }}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-medium transition-all"
          >
            <option value="">Select a service category…</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>

          <button
            onClick={handleFindMatches}
            disabled={loading || !serviceCategory}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Matching…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Find Matches
              </>
            )}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
            <svg className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-rose-700 font-semibold">{error}</p>
          </div>
        )}

        {/* ── Empty after search ── */}
        {searched && !loading && matches.length === 0 && !error && (
          <div className="mt-6 text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">No professionals found</p>
            <p className="text-xs text-slate-400 mt-1">Try a different service category.</p>
          </div>
        )}

        {/* ── Results ── */}
        {matches.length > 0 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-800">
                Top {matches.length} Matches
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {CATEGORY_LABELS[serviceCategory] || serviceCategory}
              </span>
            </div>

            {matches.map((match, index) => (
              <div
                key={match.professionalId}
                className="border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 bg-white"
              >
                {/* Top row: rank + name + score */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-extrabold text-white"
                      style={{
                        background:
                          index === 0
                            ? "linear-gradient(135deg,#F59E0B,#D97706)"
                            : index === 1
                            ? "linear-gradient(135deg,#94a3b8,#64748b)"
                            : "linear-gradient(135deg,#b45309,#92400e)",
                      }}
                    >
                      #{index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {match.professionalName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{match.serviceName}</p>
                    </div>
                  </div>
                  <ScorePill value={match.overallScore} />
                </div>

                {/* Score bar */}
                <div className="mb-4">
                  <ScoreBar value={match.overallScore} />
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <MetricCard
                    label="Location"
                    value={`${match.locationScore}%`}
                    iconBg="bg-blue-50"
                    icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Rating"
                    value={`${match.ratingScore}% (${match.factors.rating.toFixed(1)}★)`}
                    iconBg="bg-amber-50"
                    icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Expertise"
                    value={`${match.expertiseScore}%`}
                    iconBg="bg-violet-50"
                    icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Availability"
                    value={`${match.availabilityScore}%`}
                    iconBg="bg-emerald-50"
                    icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Price"
                    value={`${match.priceScore}%`}
                    iconBg="bg-teal-50"
                    icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Reviews"
                    value={match.factors.reviewCount}
                    iconBg="bg-indigo-50"
                    icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    }
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Link 
                    href={`/dashboard/services/${match.serviceSlug || match.serviceId}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm hover:shadow-md text-center"
                  >
                    Book Now
                  </Link>
                  <Link 
                    href={`/dashboard/services/${match.serviceSlug || match.serviceId}`}
                    className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs font-bold py-2 rounded-xl transition-all text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
