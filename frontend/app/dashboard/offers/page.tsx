"use client";

import { useState } from "react";
import { Copy, Check, Ticket, Gift, ArrowRight, ShieldCheck } from "lucide-react";

interface Offer {
  code: string;
  title: string;
  description: string;
  badge: string;
  expiry: string;
  terms: string[];
  gradient: string;
}

const OFFERS: Offer[] = [
  {
    code: "GEYSER30",
    title: "Get 30% Off Geyser Service",
    description: "Claim 30% flat discount on your first geyser installation or repairs. Includes full safety inspection and thermostat check.",
    badge: "Limited Time",
    expiry: "Expires Jul 31, 2026",
    terms: ["Valid only on Geyser category", "Minimum billing amount: Rs 1,000", "Cannot be combined with other offers"],
    gradient: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)"
  },
  {
    code: "INSPECTFREE",
    title: "Free Electrical Inspection",
    description: "Book an electrician this month and get diagnostic and inspection charges waived off. Pay only for parts and repairs.",
    badge: "This Month",
    expiry: "Expires Jul 31, 2026",
    terms: ["Valid once per residential user", "Diagnostics only free when repair work is done", "Valid for Kathmandu Valley region"],
    gradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
  },
  {
    code: "CLEAN500",
    title: "AC Deep Clean Discount",
    description: "Keep your home cool. Flat Rs 500 discount on AC deep cleaning, filter washing, and cooling performance optimization.",
    badge: "Few Slots Left",
    expiry: "Expires Jul 25, 2026",
    terms: ["Applies to split and cassette AC servicing", "Valid up to 3 units per booking", "Standard service warranty applies"],
    gradient: "linear-gradient(135deg, #065F46 0%, #10B981 100%)"
  },
  {
    code: "FIRSTFIX10",
    title: "10% Off First Home Service",
    description: "New to FixHub? Enter code at booking to get 10% off your very first repair request on any category.",
    badge: "New Users",
    expiry: "Valid indefinitely",
    terms: ["Valid on first booking only", "Maximum discount capped at Rs 500", "Applies to verified accounts only"],
    gradient: "linear-gradient(135deg, #B45309 0%, #D97706 100%)"
  }
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Banner / Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Offers & Promos</h1>
        <p className="text-xs text-slate-500 mt-1">
          Claim exclusive discounts and apply promotional codes to save on verified home maintenance services.
        </p>
      </div>

      {/* Grid of Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {OFFERS.map((offer) => {
          const isCopied = copiedCode === offer.code;

          return (
            <div 
              key={offer.code} 
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Card visual header */}
              <div 
                className="p-5 text-white relative min-h-[120px] flex flex-col justify-end"
                style={{ background: offer.gradient }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase">
                  {offer.badge}
                </div>
                <h3 className="text-base font-extrabold leading-snug">{offer.title}</h3>
                <p className="text-[10px] text-blue-50 mt-1">{offer.expiry}</p>
              </div>

              {/* Card content body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Terms list */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terms & Conditions</p>
                    <ul className="space-y-1">
                      {offer.terms.map((term, i) => (
                        <li key={i} className="text-[10.5px] text-slate-500 flex items-start gap-1.5 leading-snug">
                          <span className="text-slate-400 mt-1 shrink-0">•</span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Promo Code Copy Action Box */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Ticket size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Coupon Code</p>
                        <p className="text-xs font-extrabold text-slate-700 mt-1 font-mono tracking-wider">{offer.code}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(offer.code)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        isCopied 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={11} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div className="bg-[#EFF6FF] rounded-xl border border-blue-100 p-4 flex gap-3.5 items-center">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2563EB] shrink-0 shadow-sm">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">100% Verified Quality Guarantees</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            All offers apply to standard home maintenance services from verified professionals. The discount applies automatically to your final invoice upon checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
