"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, MessageSquare, Mail, AlertCircle, Clock, ShieldCheck, Ticket } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  category: "payment" | "delay" | "policy";
}

const FAQ_DATA: FAQ[] = [
  {
    question: "How do I dispute a billing amount or payment error?",
    answer: "If you notice an incorrect charge on your invoice, please contact support immediately with your Reference ID. We will place a temporary hold on the transaction and investigate the operational metrics. Refunds are processed back to the original payment source within 3-5 business days.",
    category: "payment"
  },
  {
    question: "What should I do if my technician is running late?",
    answer: "Operations tracks all specialists via GPS in real time. If a technician faces traffic or mechanical delays, their status will update in your 'Active Bookings' timeline. You can call them directly using the button inside the booking details panel, or override the booking to request a supervisor dispatch.",
    category: "delay"
  },
  {
    question: "How do I cancel or reschedule my service appointment?",
    answer: "You can modify scheduled services directly from your 'Active Bookings' dashboard by clicking 'Reschedule'. Cancellations made at least 24 hours prior to the scheduled window are fully refunded without fees. Cancellations inside the 24-hour window may incur a standard dispatch fee.",
    category: "policy"
  }
];

const MOCK_TICKETS = [
  { id: "TK-48102", service: "AC Seasonal Maintenance", status: "In Investigation", date: "July 11, 2026", updates: "Assigned to Operations Lead" },
  { id: "TK-47991", service: "Kitchen Pipe Replacement", status: "Resolved", date: "June 19, 2026", updates: "Refund processed" }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "payment" | "delay" | "policy">("all");

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-12">
      
      {/* 1. Hero Section - Centered Search Bar */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">How can we help you today?</h1>
        <p className="text-sm text-slate-500">Search our knowledge base or get in touch with our operations team.</p>
        
        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type your question (e.g. 'refund', 'technician delay')..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Grid Layout: Main FAQs & Open Tickets Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: FAQ and Self-Service Flow */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Help Category Cards (3 columns) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick intent helpers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedCategory("payment")}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                  selectedCategory === "payment" ? "border-blue-500 bg-blue-50/30" : "border-gray-200 bg-white"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Payment Issues</p>
                <p className="text-xs text-slate-500 mt-1">Disputes, refunds & invoice details</p>
              </button>

              <button
                onClick={() => setSelectedCategory("delay")}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                  selectedCategory === "delay" ? "border-blue-500 bg-blue-50/30" : "border-gray-200 bg-white"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                  <Clock className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Technician Delay</p>
                <p className="text-xs text-slate-500 mt-1">ETA delay tracker & dispatch</p>
              </button>

              <button
                onClick={() => setSelectedCategory("policy")}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                  selectedCategory === "policy" ? "border-blue-500 bg-blue-50/30" : "border-gray-200 bg-white"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Cancel / Reschedule</p>
                <p className="text-xs text-slate-500 mt-1">Change dates, fees & rules</p>
              </button>
            </div>
          </div>

          {/* Contextual FAQs Accordion (expanded in place) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Frequently Asked Questions</h3>
              {selectedCategory !== "all" && (
                <button onClick={() => setSelectedCategory("all")} className="text-xs text-blue-600 hover:underline">Show All FAQs</button>
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
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
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
                  No matching FAQs found. Try searching another topic.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Open Tickets Widget */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">My open tickets</h3>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
            {MOCK_TICKETS.map(ticket => (
              <div key={ticket.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-500">{ticket.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ticket.status === "Resolved" ? "bg-emerald-50 text-emerald-700" : "bg-blue-55 bg-blue-50 text-blue-700"
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

      </div>

      {/* Bottom Section: Direct Human Action channels */}
      <div className="border-t border-slate-200 pt-8 text-center space-y-4">
        <h3 className="text-[15px] font-bold text-slate-800">Still need assistance?</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">Get connected immediately to our live agents or send an offline email request.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => alert("Initiating Live Chat with Support Desk...")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 transition-colors shadow-sm"
          >
            <MessageSquare className="h-4.5 w-4.5" />
            Start Live Chat
          </button>
          <button
            onClick={() => alert("Redirecting to email dispatch...")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-3 transition-colors"
          >
            <Mail className="h-4.5 w-4.5 text-slate-500" />
            Email Us
          </button>
        </div>
      </div>

    </div>
  );
}
