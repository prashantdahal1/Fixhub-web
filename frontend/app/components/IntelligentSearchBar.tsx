"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Category = "Electrician" | "Plumber" | "Painter" | "Carpenter" | "AC Repair";

interface QuestionStep {
  question: string;
  options: string[];
}

interface Flow {
  category: Category;
  icon: React.ReactElement;
  color: string;
  questions: QuestionStep[];
}

// ─── Icons ──────────────────────────────────────────────────────────────────────
const BoltIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={`${color}22`} />
  </svg>
);
const WrenchIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const PaintIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="8" rx="2" fill={`${color}22`} />
    <path d="M5 11v4" />
    <rect x="3" y="15" width="4" height="5" rx="1" fill={`${color}22`} />
    <line x1="17" y1="7" x2="21" y2="7" />
  </svg>
);
const HammerIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
    <path d="M17.64 15L22 10.64" />
    <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.75l-2.25-2.25H14l-.34.34-.75-.75-.34.34L9 6.5l.75.75L9 8l1.5 1.5 1.5-1.5 3 3z" />
  </svg>
);
const AirCondIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="9" rx="2" fill={`${color}22`} />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M6 19c0-2 2-4 6-4s6 2 6 4" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const AlertTriIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="10.29 3.86 1.82 18 22.18 18 13.71 3.86 10.29 3.86" fill="rgba(239,68,68,0.15)" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const ChevRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Keyword Matching ───────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  "AC Repair":   ["ac", "air", "cooling", "cold", "conditioner", "heat", "hvac", "fan unit", "aircondition"],
  "Plumber":     ["pipe", "leak", "water", "tap", "drain", "flush", "toilet", "sink", "geyser", "plumb"],
  "Electrician": ["light", "switch", "wire", "wiring", "electricity", "power", "electric", "circuit", "socket", "bulb", "fuse", "electrician"],
  "Painter":     ["paint", "wall", "color", "colour", "room", "ceiling", "coat", "painter"],
  "Carpenter":   ["door", "wood", "shelf", "cabinet", "furniture", "window", "drawer", "hinge", "lock", "carpenter"],
};

const URGENT_KEYWORDS = ["flood", "burst", "fire", "sparking", "spark", "no power", "blackout", "gas leak", "smoke", "emergency", "urgent", "immediately", "burning"];

// ─── Per-Category Question Flows ────────────────────────────────────────────────
const FLOWS: Flow[] = [
  {
    category: "AC Repair",
    icon: <AirCondIcon />,
    color: "#2563EB",
    questions: [
      { question: "What's the issue with your AC?", options: ["Not cooling", "Strange noise", "Leaking water", "Won't turn on"] },
      { question: "How many units need servicing?", options: ["1 unit", "2 units", "3+ units"] },
    ],
  },
  {
    category: "Plumber",
    icon: <WrenchIcon color="#0891B2" />,
    color: "#0891B2",
    questions: [
      { question: "Where is the issue located?", options: ["Kitchen", "Bathroom", "Main supply", "Drain / Sewage"] },
      { question: "How severe is it?", options: ["Minor drip", "Moderate flow", "Major / Flooding"] },
    ],
  },
  {
    category: "Electrician",
    icon: <BoltIcon color="#D97706" />,
    color: "#D97706",
    questions: [
      { question: "What's the problem?", options: ["No power", "Flickering lights", "New installation", "Wiring check"] },
      { question: "Which area is affected?", options: ["Single room", "Multiple rooms", "Entire property"] },
    ],
  },
  {
    category: "Painter",
    icon: <PaintIcon color="#7C3AED" />,
    color: "#7C3AED",
    questions: [
      { question: "What needs painting?", options: ["Interior walls", "Exterior walls", "Single room", "Full home"] },
      { question: "Approximate area?", options: ["< 500 sq ft", "500–1000 sq ft", "1000+ sq ft"] },
    ],
  },
  {
    category: "Carpenter",
    icon: <HammerIcon color="#92400E" />,
    color: "#92400E",
    questions: [
      { question: "Type of work needed?", options: ["Repair existing", "New installation", "Custom furniture"] },
      { question: "What item?", options: ["Door / Window", "Cabinet / Shelf", "Bed / Wardrobe", "Other"] },
    ],
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────────
export function IntelligentSearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [activeFlow, setActiveFlow] = useState<Flow | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Keyword → category detection
  const detected = useMemo<Category | null>(() => {
    if (!query.trim()) return null;
    const lower = query.toLowerCase();
    for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
      if (kws.some((kw) => lower.includes(kw))) return cat as Category;
    }
    return null;
  }, [query]);

  const urgentDetected = useMemo(() => {
    const lower = query.toLowerCase();
    return URGENT_KEYWORDS.some((kw) => lower.includes(kw));
  }, [query]);

  // React to detection changes
  useEffect(() => {
    if (detected && query.length >= 2) {
      const flow = FLOWS.find((f) => f.category === detected) || null;
      setActiveFlow(flow);
      setIsUrgent(urgentDetected);
      if (!isOpen) {
        setIsOpen(true);
        setStep(1);
        setAnswers([]);
      }
    } else if (!detected && query.length === 0) {
      reset();
    }
  }, [detected, urgentDetected, query]);

  // Outside click / Escape to dismiss
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) reset();
    };
    const onEscape = (e: KeyboardEvent) => { if (e.key === "Escape") reset(); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const reset = () => {
    setIsOpen(false);
    setStep(0);
    setAnswers([]);
    setActiveFlow(null);
    setIsUrgent(false);
    setQuery("");
    setAnimating(false);
  };

  const handleAnswer = (answer: string) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      const next = [...answers, answer];
      setAnswers(next);
      if (activeFlow && next.length >= activeFlow.questions.length) {
        setStep(3);
      } else {
        setStep((s) => s + 1);
      }
      setAnimating(false);
    }, 180);
  };

  const flow = activeFlow;
  const currentQ = flow?.questions[step - 1];

  // Dynamic border styling
  const borderCls = isUrgent
    ? "border-red-500 ring-2 ring-red-100"
    : isOpen
    ? "border-[#2563EB] ring-2 ring-blue-100"
    : "border-gray-200 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100";

  return (
    <div ref={containerRef} className="relative w-full" style={{ zIndex: 50 }}>

      {/* ═══ INPUT BAR ═══ */}
      <div className={`flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border transition-all duration-300 ${borderCls}`}>
        {/* Left icon */}
        <span className={`shrink-0 transition-colors duration-200 ${isUrgent ? "text-red-500" : isOpen ? "text-[#2563EB]" : "text-gray-400"}`}>
          {isUrgent
            ? <AlertTriIcon />
            : flow
            ? React.cloneElement(flow.icon, { color: flow.color } as any)
            : <SearchIcon />}
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (detected) setIsOpen(true); }}
          placeholder={isUrgent ? "Emergency detected — we're on it..." : "Describe your issue (e.g. my AC is not cooling)"}
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />

        {/* Urgency badge */}
        {isUrgent && (
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            URGENT
          </span>
        )}

        {/* Category chip */}
        {!isUrgent && flow && (
          <span
            className="shrink-0 flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 border"
            style={{ color: flow.color, backgroundColor: `${flow.color}14`, borderColor: `${flow.color}44` }}
          >
            {React.cloneElement(flow.icon, { color: flow.color } as any)}
            {flow.category}
          </span>
        )}

        {/* Clear button */}
        {query && (
          <button
            onClick={reset}
            className="shrink-0 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* ═══ DROPDOWN PANEL ═══ */}
      <div
        className="absolute top-full left-0 right-0 mt-2 overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? "480px" : "0px",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div className={`bg-white rounded-2xl shadow-2xl border overflow-hidden ${isUrgent ? "border-red-200" : "border-blue-100"}`}>

          {/* ── Step progress bar ── */}
          {flow && step < 3 && (
            <div className="px-4 pt-4 pb-1 flex items-center gap-2">
              {flow.questions.map((_, i) => (
                <React.Fragment key={i}>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shrink-0"
                    style={{
                      backgroundColor: i < step ? flow.color : i === step - 1 ? flow.color : "#F1F5F9",
                      color: i <= step - 1 ? "white" : "#94A3B8",
                    }}
                  >
                    {i < step - 1 ? <CheckIcon /> : i + 1}
                  </div>
                  {i < flow.questions.length - 1 && (
                    <div
                      className="h-0.5 flex-1 transition-all duration-500 rounded-full"
                      style={{ backgroundColor: i < step - 1 ? flow.color : "#E2E8F0" }}
                    />
                  )}
                </React.Fragment>
              ))}
              <span className="ml-2 text-[11px] text-gray-400 font-medium shrink-0">
                {step} / {flow.questions.length}
              </span>
            </div>
          )}

          {/* ── Q&A Panel ── */}
          {flow && step >= 1 && step < 3 && currentQ && (
            <div
              className="p-4"
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? "translateY(8px)" : "translateY(0)",
                transition: "opacity 0.18s ease, transform 0.18s ease",
              }}
            >
              {/* Emergency banner */}
              {isUrgent && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriIcon />
                  <p className="text-xs font-semibold text-red-700">Emergency detected — we'll prioritize your booking.</p>
                </div>
              )}

              <p className="text-sm font-semibold text-gray-800 mb-3">{currentQ.question}</p>

              {/* Option chips */}
              <div className="flex flex-wrap gap-2">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 hover:shadow-sm active:scale-95"
                    style={{
                      borderColor: isUrgent ? "#FCA5A5" : `${flow.color}55`,
                      color: isUrgent ? "#DC2626" : flow.color,
                      backgroundColor: isUrgent ? "#FFF5F5" : `${flow.color}0D`,
                    }}
                  >
                    {opt}
                    <ChevRightIcon />
                  </button>
                ))}
              </div>

              {/* Previous answers */}
              {answers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-gray-400 font-medium">Answered:</span>
                  {answers.map((a, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                      style={{ color: flow.color, borderColor: `${flow.color}33`, backgroundColor: `${flow.color}0A` }}
                    >
                      <CheckIcon />
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Summary Card ── */}
          {step === 3 && flow && (
            <div className="p-4">
              {/* Gradient header */}
              <div
                className="rounded-xl p-4 mb-3 relative overflow-hidden"
                style={{
                  background: isUrgent
                    ? "linear-gradient(135deg, #7F1D1D, #DC2626)"
                    : `linear-gradient(135deg, #1E3A8A, ${flow.color})`,
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">{flow.category}</span>
                      {isUrgent && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-200 bg-white/10 border border-white/20 rounded-full px-2 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-300 inline-block animate-pulse" />
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-white font-bold text-base leading-tight truncate">{answers[0]}</p>
                    {answers[1] && <p className="text-white/70 text-sm mt-0.5">{answers[1]}</p>}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    {React.cloneElement(flow.icon, { color: "white" } as any)}
                  </div>
                </div>
              </div>

              {/* Detail pills */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  {React.cloneElement(flow.icon, { color: flow.color } as any)}
                  <span className="text-xs text-gray-600 font-medium">{flow.category}</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isUrgent ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                  <span className={`text-xs font-semibold ${isUrgent ? "text-red-600" : "text-emerald-700"}`}>
                    {isUrgent ? "Emergency" : "Standard"}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/bookings")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: isUrgent
                      ? "linear-gradient(135deg, #B91C1C, #DC2626)"
                      : `linear-gradient(135deg, #1E3A8A, ${flow.color})`,
                  }}
                >
                  {isUrgent ? "🚨 Book Emergency" : "Book Now →"}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          {step < 3 && (
            <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Press{" "}
                <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-mono">Esc</kbd>{" "}
                to dismiss
              </p>
              <button onClick={reset} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
