"use client";

import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Search, ChevronDown, ChevronUp, MessageSquare, Mail, AlertCircle, Clock, ShieldCheck, Ticket, X, Send, Briefcase, Star, CreditCard } from "lucide-react";
import { apiFetch } from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const CUSTOMER_FAQS: FAQ[] = [
  {
    question: "How do I dispute a billing amount or payment error?",
    answer: "If you notice an incorrect charge on your invoice, please contact support immediately with your Reference ID. We will place a temporary hold on the transaction and investigate. Refunds are processed back to the original payment source within 3-5 business days.",
    category: "payment",
  },
  {
    question: "What should I do if my technician is running late?",
    answer: "Operations tracks all specialists via GPS in real time. If a technician faces traffic or delays, their status will update in your 'Active Bookings' timeline. You can call them directly using the button inside the booking details panel, or request a supervisor dispatch.",
    category: "delay",
  },
  {
    question: "How do I cancel or reschedule my service appointment?",
    answer: "You can modify scheduled services directly from your 'Active Bookings' dashboard by clicking 'Reschedule'. Cancellations made at least 24 hours prior are fully refunded. Cancellations inside the 24-hour window may incur a standard dispatch fee.",
    category: "policy",
  },
];

const PRO_FAQS: FAQ[] = [
  {
    question: "When does escrow release after I complete a job?",
    answer: "Escrow is released automatically once you mark a job as 'Complete' and the customer confirms satisfaction. In case of no customer response within 48 hours of completion, escrow is auto-released to your wallet. If there's a dispute, our operations team investigates within 3 business days.",
    category: "payment",
  },
  {
    question: "A customer is not responding or has abandoned the booking — what do I do?",
    answer: "If a customer is unresponsive at the scheduled time, use the 'Report Issue' button in the booking details and document it with photos. Our team will review the case and, if validated, you will receive a partial compensation for the dispatch cost.",
    category: "delay",
  },
  {
    question: "How do I get my license verified faster?",
    answer: "Ensure your Industrial/Business License is clearly uploaded in your profile settings. Our admin team reviews verifications within 1-2 business days. If it's been more than 48 hours, raise a support ticket and our team will expedite the review.",
    category: "policy",
  },
  {
    question: "How do I update my service pricing or availability?",
    answer: "Go to Dashboard → Services, select your service, and click 'Edit'. You can update your base price, availability hours, and service description at any time. Changes reflect immediately for new bookings.",
    category: "policy",
  },
];

const CUSTOMER_CATEGORIES = [
  { key: "payment", label: "Payment Issues",    icon: AlertCircle, sub: "Disputes, refunds & invoices" },
  { key: "delay",   label: "Technician Delay",  icon: Clock,        sub: "ETA delay & dispatch help" },
  { key: "policy",  label: "Cancel / Reschedule", icon: ShieldCheck, sub: "Change dates, fees & rules" },
];

const PRO_CATEGORIES = [
  { key: "payment", label: "Escrow & Payments", icon: CreditCard,  sub: "Release, disputes & wallet" },
  { key: "delay",   label: "Customer Issues",   icon: Clock,        sub: "No-shows & unresponsive" },
  { key: "policy",  label: "Verification & Docs", icon: ShieldCheck, sub: "License, profile & rates" },
];

const MOCK_TICKETS = [
  { id: "TK-48102", service: "AC Seasonal Maintenance", status: "In Investigation", date: "July 11, 2026", updates: "Assigned to Operations Lead" },
  { id: "TK-47991", service: "Kitchen Pipe Replacement", status: "Resolved", date: "June 19, 2026", updates: "Refund processed" },
];

const TICKET_CATEGORIES_PRO = ["Escrow / Payment Issue", "Verification Problem", "Customer Dispute", "Technical Bug", "Booking Problem", "Other"];
const TICKET_CATEGORIES_CUSTOMER = ["Payment / Refund", "Technician Delay", "Cancellation", "Invoice Error", "Account Issue", "Other"];

export default function SupportPage() {
  const { user } = useAuth();
  const isPro = user?.role === "professional";

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const faqs = isPro ? PRO_FAQS : CUSTOMER_FAQS;
  const categories = isPro ? PRO_CATEGORIES : CUSTOMER_CATEGORIES;
  const ticketCategories = isPro ? TICKET_CATEGORIES_PRO : TICKET_CATEGORIES_CUSTOMER;

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleRaiseTicket = async () => {
    if (!ticketSubject.trim() || !ticketCategory || !ticketMessage.trim()) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(API.TICKETS.CREATE, {
        method: "POST",
        body: JSON.stringify({
          subject: ticketSubject,
          category: ticketCategory,
          message: ticketMessage,
        }),
      });
      toast.success("Ticket raised successfully! Our team will respond within 24 hours.");
      setShowRaiseTicket(false);
      setTicketSubject("");
      setTicketCategory("");
      setTicketMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to raise ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-12">

      {/* ── Hero / Search ────────────────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isPro ? "Professional Support Centre" : "How can we help you today?"}
        </h1>
        <p className="text-sm text-slate-500">
          {isPro
            ? "Get help with escrow, verifications, customer disputes, and platform issues."
            : "Search our knowledge base or get in touch with our operations team."}
        </p>

        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isPro ? "Search e.g. 'escrow', 'verification', 'dispute'..." : "Type your question e.g. 'refund', 'technician delay'..."}
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
          />
        </div>

        {/* Raise Ticket CTA for Pros */}
        {isPro && (
          <div className="pt-1">
            <button
              onClick={() => setShowRaiseTicket(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 transition-colors shadow-sm"
            >
              <Ticket className="h-4 w-4" />
              Raise a Support Ticket
            </button>
          </div>
        )}
      </div>

      {/* ── Raise Ticket Modal ───────────────────────────────────────────────── */}
      {showRaiseTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRaiseTicket(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Raise a Support Ticket</h2>
                <p className="text-xs text-slate-500 mt-0.5">Our team responds within 24 hours on working days.</p>
              </div>
              <button
                onClick={() => setShowRaiseTicket(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a category…</option>
                  {ticketCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief summary of your issue…"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue in detail. Include booking IDs or order numbers if applicable…"
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowRaiseTicket(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseTicket}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "Submitting…" : "Submit Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2 columns: Categories + FAQs */}
        <div className="lg:col-span-2 space-y-8">

          {/* Category Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isPro ? "Topic Areas" : "Quick intent helpers"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map(({ key, label, icon: Icon, sub }) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(selectedCategory === key ? "all" : key)}
                  className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                    selectedCategory === key ? "border-blue-500 bg-blue-50/40" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500 mt-1">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Frequently Asked Questions
              </h3>
              {selectedCategory !== "all" && (
                <button onClick={() => setSelectedCategory("all")} className="text-xs text-blue-600 hover:underline">
                  Show All FAQs
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filteredFaqs.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 text-[14px]"
                    >
                      {faq.question}
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-400 bg-white rounded-xl border border-gray-100">
                  No matching FAQs found. Try searching another topic or raise a ticket.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tickets + Actions */}
        <div className="space-y-4">

          {/* Raise Ticket widget for pros */}
          {isPro && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <Ticket className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Need direct help?</p>
                  <p className="text-xs text-slate-500">Raise a ticket for your issue</p>
                </div>
              </div>
              <button
                onClick={() => setShowRaiseTicket(true)}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition-colors"
              >
                + Raise a Ticket
              </button>
            </div>
          )}

          {/* Open Tickets Widget */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Open Tickets</h3>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
              {MOCK_TICKETS.map((ticket) => (
                <div key={ticket.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-500">{ticket.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === "Resolved" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{ticket.service}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ticket.date}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg text-xs text-slate-600">
                    <Ticket className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ticket.updates}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro-specific rating card */}
          {isPro && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-bold text-amber-800">Maintain your rating</p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Pros with a rating above 4.5 get priority in search rankings. Resolve customer complaints quickly to protect your score.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom: Contact Channels ─────────────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-8 text-center space-y-4">
        <h3 className="text-[15px] font-bold text-slate-800">Still need assistance?</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Get connected to our live agents or send an offline email request.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => alert("Initiating Live Chat with Support Desk...")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 transition-colors shadow-sm"
          >
            <MessageSquare className="h-4 w-4" />
            Start Live Chat
          </button>
          <button
            onClick={() => alert("Redirecting to email dispatch...")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-3 transition-colors"
          >
            <Mail className="h-4 w-4 text-slate-500" />
            Email Us
          </button>
          {isPro && (
            <button
              onClick={() => setShowRaiseTicket(true)}
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-5 py-3 transition-colors"
            >
              <Ticket className="h-4 w-4" />
              Raise Ticket
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
