"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Wrench,
  Zap,
  Home,
  Thermometer,
  Hammer,
  Paintbrush,
  Droplets,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Play,
  Quote,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const services = [
  { icon: Droplets, title: "Plumbing", desc: "Leak fixes, pipe installation, drain cleaning", color: "bg-blue-50 text-blue-600" },
  { icon: Zap, title: "Electrical", desc: "Wiring, panel upgrades, outlet installation", color: "bg-amber-50 text-amber-600" },
  { icon: Home, title: "Roofing", desc: "Repairs, waterproofing, inspections", color: "bg-slate-50 text-slate-600" },
  { icon: Thermometer, title: "HVAC", desc: "AC service, heating, ventilation systems", color: "bg-cyan-50 text-cyan-600" },
  { icon: Hammer, title: "Carpentry", desc: "Doors, windows, furniture assembly", color: "bg-orange-50 text-orange-600" },
  { icon: Paintbrush, title: "Painting", desc: "Interior, exterior, touch-ups", color: "bg-purple-50 text-purple-600" },
];

const steps = [
  { num: "01", title: "Describe your issue", desc: "Tell us what needs fixing — takes 30 seconds. No complicated forms." },
  { num: "02", title: "Get matched instantly", desc: "We find verified pros near you in real time. Background-checked, rated." },
  { num: "03", title: "Book & relax", desc: "Confirm your slot and track your pro live. Pay only when satisfied." },
];

const testimonials = [
  { name: "Aarav Sharma", role: "Homeowner, Lalitpur", quote: "Got my leaking pipe fixed within 2 hours. The pro was verified and professional. Would absolutely use again.", avatar: "AS", rating: 5 },
  { name: "Priya Thapa", role: "Apartment Owner, Bhaktapur", quote: "Booked an electrician at 9 PM and he showed up the next morning. Seamless experience from start to finish.", avatar: "PT", rating: 5 },
  { name: "Rohan KC", role: "Office Manager, Kathmandu", quote: "Used FixHub for our office AC service. Fast, fair pricing, zero hassle. Our go-to for any maintenance now.", avatar: "RK", rating: 5 },
];

const stats = [
  { value: "12,000+", label: "Repairs completed" },
  { value: "4.9", label: "Average rating" },
  { value: "30 min", label: "Avg. response time" },
  { value: "98%", label: "Satisfaction rate" },
];

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans antialiased">

      {/* ── NAV ── */}
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-slate-50/50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Verified professionals, instant booking
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-slate-900">
                Home repairs,{" "}
                <span className="relative">
                  <span className="relative z-10 text-blue-600">handled fast.</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-blue-100/60 -z-0 rounded-sm" />
                </span>
              </h1>

              <p className="text-slate-500 text-lg max-w-lg mb-8 leading-relaxed">
                Book trusted local pros for plumbing, electrical, roofing, and more — in minutes, not days. No phone calls, no waiting.
              </p>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="What needs fixing?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Find a Pro
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-5 mt-8 text-slate-400 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Background-checked
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Fixed pricing
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  30-min response
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">John Doe</p>
                    <p className="text-xs text-slate-400">Plumber • 4.9 ★</p>
                  </div>
                  <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Available</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Droplets size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Pipe Leak Repair</p>
                      <p className="text-xs text-slate-400">Estimated: 45 mins</p>
                    </div>
                    <span className="ml-auto text-sm font-semibold text-slate-900">Rs. 1,200</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Zap size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Electrical Wiring</p>
                      <p className="text-xs text-slate-400">Estimated: 2 hours</p>
                    </div>
                    <span className="ml-auto text-sm font-semibold text-slate-900">Rs. 2,500</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-500">+2k</div>
                  </div>
                  <p className="text-xs text-slate-400">2,400+ happy customers</p>
                </div>
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-900">4.9</span>
                </div>
                <p className="text-xs text-slate-400">Average rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-10 px-6 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">What we cover</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Every home service, one app</h2>
            </div>
            <Link href="/services" className="hidden md:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all services
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="group bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5"
                >
                  <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-blue-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Book now
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 md:hidden text-center">
            <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
              View all services
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Simple process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">From problem to fixed — fast</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-slate-200" />

            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-sm font-bold text-white mx-auto mb-6 shadow-lg shadow-blue-600/20 relative z-10">
                  {step.num}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BANNER ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />

            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Why homeowners trust FixHub</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  We do not just connect you with any handyman. Every pro on our platform is background-checked, skill-verified, and rated by real customers like you.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: "Background-checked professionals" },
                    { icon: Clock, text: "Average 30-minute response time" },
                    { icon: CheckCircle2, text: "Pay only after job completion" },
                    { icon: Star, text: "4.9+ average rating across all services" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <item.icon size={16} className="text-blue-400" />
                      </div>
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Background Check", status: "Passed", color: "text-emerald-400" },
                      { label: "Skill Verification", status: "Verified", color: "text-emerald-400" },
                      { label: "Customer Rating", status: "4.9 / 5.0", color: "text-amber-400" },
                      { label: "Response Time", status: "12 min avg", color: "text-blue-400" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-sm text-slate-400">{item.label}</span>
                        <span className={`text-sm font-semibold ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">What homeowners say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div 
                key={t.name} 
                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-default"
                onMouseEnter={() => setActiveTestimonial(i)}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="mb-5">
                  <Quote size={20} className="text-blue-200 mb-2" />
                  <p className="text-slate-600 text-sm leading-relaxed">{t.quote}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-10 md:p-16 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get it fixed?</h2>
              <p className="text-blue-100 mb-10 max-w-md mx-auto text-sm leading-relaxed">
                Join thousands of homeowners in Kathmandu Valley who have already discovered the easiest way to maintain their homes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Book your first fix
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 text-white font-semibold text-sm px-8 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
                >
                  <Play size={14} />
                  See how it works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                  <Wrench size={16} className="text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Fix<span className="text-blue-600">Hub</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Connecting Kathmandu Valley homeowners with verified, skilled professionals. Fast, fair, and hassle-free home services.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Services</h4>
              <div className="space-y-2.5">
                {["Plumbing", "Electrical", "HVAC", "Carpentry", "Painting", "Roofing"].map((s) => (
                  <a key={s} href="#" className="block text-sm text-slate-400 hover:text-blue-600 transition-colors">{s}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Company</h4>
              <div className="space-y-2.5">
                {["About us", "How it works", "Careers", "Blog", "Contact"].map((s) => (
                  <a key={s} href="#" className="block text-sm text-slate-400 hover:text-blue-600 transition-colors">{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              © 2025 FixHub. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><MapPin size={16} /></a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Phone size={16} /></a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Mail size={16} /></a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
