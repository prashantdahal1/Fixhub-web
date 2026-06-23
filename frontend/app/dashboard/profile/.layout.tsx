"use client";

import Link from "next/link";
import { useState } from "react";

const services = [
  { icon: "🔧", title: "Plumbing", desc: "Leak fixes, pipe installation, drain cleaning" },
  { icon: "⚡", title: "Electrical", desc: "Wiring, panel upgrades, outlet installation" },
  { icon: "🏠", title: "Roofing", desc: "Repairs, waterproofing, inspections" },
  { icon: "❄️", title: "HVAC", desc: "AC service, heating, ventilation systems" },
  { icon: "🪟", title: "Carpentry", desc: "Doors, windows, furniture assembly" },
  { icon: "🖌️", title: "Painting", desc: "Interior, exterior, touch-ups" },
];

const steps = [
  { num: "01", title: "Describe your issue", desc: "Tell us what needs fixing — takes 30 seconds." },
  { num: "02", title: "Get matched instantly", desc: "We find verified pros near you in real time." },
  { num: "03", title: "Book & relax", desc: "Confirm your slot and track your pro live." },
];

const testimonials = [
  { name: "Aarav Sharma", role: "Homeowner, Lalitpur", quote: "Got my leaking pipe fixed within 2 hours. The pro was verified and professional.", avatar: "AS" },
  { name: "Priya Thapa", role: "Apartment Owner, Bhaktapur", quote: "Booked an electrician at 9 PM and he showed up the next morning. Seamless.", avatar: "PT" },
  { name: "Rohan KC", role: "Office Manager, Kathmandu", quote: "Used FixHub for our office AC service. Fast, fair pricing, zero hassle.", avatar: "RK" },
];

export default function LandingPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-[#070B14] text-white font-sans">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070B14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Fix<span className="text-[#2196F3]">Hub</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-[#1565C0] to-[#2196F3] hover:from-[#1976D2] hover:to-[#42A5F5] text-white px-4 py-2 rounded-lg transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#1565C0]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-[#2196F3]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#1565C0]/20 border border-[#2196F3]/30 text-[#60AAFF] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2196F3] animate-pulse" />
            Verified professionals, instant booking
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Home repairs,{" "}
            <span className="bg-gradient-to-r from-[#2196F3] to-[#60AAFF] bg-clip-text text-transparent">
              handled fast.
            </span>
          </h1>

          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Book trusted local pros for plumbing, electrical, roofing, and more — in minutes, not days.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="What needs fixing? e.g. leaking tap..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-[#111827] border border-white/10 text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#2196F3]/60 transition-colors"
            />
            <Link
              href="/signup"
              className="bg-gradient-to-r from-[#1565C0] to-[#2196F3] hover:from-[#1976D2] hover:to-[#42A5F5] text-white font-medium text-sm px-6 py-3 rounded-xl transition-all whitespace-nowrap"
            >
              Find a Pro →
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-white/30 text-xs">
            <span>✓ Background-checked pros</span>
            <span>✓ Fixed pricing</span>
            <span>✓ 30-min response</span>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-[#2196F3] text-sm font-medium mb-2 uppercase tracking-widest">What we cover</p>
            <h2 className="text-3xl font-bold">Every home service, one app</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="group bg-[#0D1525] border border-white/5 hover:border-[#2196F3]/30 rounded-2xl p-6 transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-[#2196F3] text-sm font-medium mb-2 uppercase tracking-widest">Simple process</p>
            <h2 className="text-3xl font-bold">From problem to fixed — fast</h2>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#2196F3] flex items-center justify-center text-sm font-bold text-white/80">
                  {step.num}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute left-7 mt-16 w-px h-6 bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-[#2196F3] text-sm font-medium mb-2 uppercase tracking-widest">Reviews</p>
            <h2 className="text-3xl font-bold">What homeowners say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#0D1525] border border-white/5 rounded-2xl p-6">
                <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1565C0] to-[#2196F3] flex items-center justify-center text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#0D47A1] p-12">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-3">Ready to get it fixed?</h2>
              <p className="text-white/70 mb-8 text-sm">Join thousands of homeowners in Kathmandu Valley using FixHub.</p>
              <Link
                href="/signup"
                className="inline-block bg-white text-[#1565C0] font-semibold text-sm px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Book your first fix →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs">
          <span>
            Fix<span className="text-[#2196F3]">Hub</span> — Instant Home Solutions
          </span>
          <span>© 2025 FixHub. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
