"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      num: "01",
      title: "Information We Collect",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>At FixHub, we collect information you provide directly to us, including:</p>
          <ul className="space-y-2">
            {[
              { label: "Account Information", desc: "Name, email address, phone number, username, and password" },
              { label: "Profile Information", desc: "Profile picture, address, city, province, and bio" },
              { label: "Professional Information", desc: "Verification documents, national ID, service details, and certifications" },
              { label: "Booking Information", desc: "Service requests, booking details, payment information, and communication history" },
              { label: "Location Information", desc: "Your city and province for matching you with nearby professionals" },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span><span className="font-semibold text-slate-800">{item.label}:</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      num: "02",
      title: "How We Use Your Information",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>We use the information we collect to:</p>
          <ul className="space-y-2">
            {[
              "Provide, maintain, and improve our services",
              "Process bookings and payments",
              "Match customers with qualified professionals",
              "Send you notifications about bookings, messages, and account updates",
              "Verify professional identities and credentials",
              "Prevent fraud and ensure platform security",
              "Comply with legal obligations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      num: "03",
      title: "Information Sharing",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>We may share your information in the following circumstances:</p>
          <ul className="space-y-2">
            {[
              { label: "With Professionals", desc: "When you book a service, we share your contact information and booking details with the assigned professional" },
              { label: "With Customers", desc: "For professionals, we share your profile information, ratings, and service details with potential customers" },
              { label: "Service Providers", desc: "We use third-party services for payment processing, email delivery, and other operational functions" },
              { label: "Legal Requirements", desc: "We may disclose information if required by law or to protect our rights" },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span><span className="font-semibold text-slate-800">{item.label}:</span> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      num: "04",
      title: "Data Security",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>We implement appropriate security measures to protect your information:</p>
          <ul className="space-y-2">
            {[
              "Encryption of sensitive data in transit and at rest",
              "Secure password storage using bcrypt hashing",
              "Regular security audits and updates",
              "Access controls and authentication systems",
              "Secure payment processing through trusted gateways",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      num: "05",
      title: "Your Rights",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>You have the right to:</p>
          <ul className="space-y-2">
            {[
              "Access and view your personal information",
              "Update or correct your personal information",
              "Delete your account and associated data",
              "Opt out of marketing communications",
              "Request a copy of your data",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      num: "06",
      title: "Cookies and Tracking",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>We use cookies and similar technologies to:</p>
          <ul className="space-y-2">
            {[
              "Keep you logged in to your account",
              "Remember your preferences",
              "Analyze platform usage and improve our services",
              "Provide personalized content and recommendations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      num: "07",
      title: "Children's Privacy",
      content: (
        <p className="text-slate-600 text-sm leading-relaxed">
          FixHub is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
        </p>
      ),
    },
    {
      num: "08",
      title: "Changes to This Policy",
      content: (
        <p className="text-slate-600 text-sm leading-relaxed">
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
        </p>
      ),
    },
    {
      num: "09",
      title: "Contact Us",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>If you have questions about this privacy policy, please contact us at:</p>
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span><span className="font-semibold text-slate-800">Email:</span> support@fixhub.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span><span className="font-semibold text-slate-800">Address:</span> Kathmandu, Nepal</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 60%, #3B82F6 100%)" }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 transition-colors mb-8"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </Link>

          <div className="flex items-center gap-4">
            {/* Shield icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.15)" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-blue-200 text-sm mt-1">Last updated: July 29, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 pb-16 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {sections.map((section, idx) => (
            <div
              key={section.num}
              className={`px-8 py-7 ${idx < sections.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <h2 className="flex items-center gap-3 text-base font-bold text-slate-900 mb-4">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold shrink-0">
                  {section.num}
                </span>
                {section.title}
              </h2>
              {section.content}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 FixHub · Kathmandu, Nepal ·{" "}
          <Link href="/terms-and-conditions" className="text-blue-500 hover:text-blue-700 font-medium transition-colors">
            Terms &amp; Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
