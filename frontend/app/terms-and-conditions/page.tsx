"use client";

import Link from "next/link";

export default function TermsAndConditionsPage() {
  const sections = [
    {
      num: "01",
      title: "Acceptance of Terms",
      content: (
        <div className="space-y-2 text-slate-600 text-sm leading-relaxed">
          <p>By accessing or using FixHub, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.</p>
          <p>FixHub reserves the right to modify these terms at any time. Your continued use of the platform after changes constitutes acceptance of the updated terms.</p>
        </div>
      ),
    },
    {
      num: "02",
      title: "Account Registration",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>To use FixHub, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
          <ul className="space-y-2">
            {[
              "You must be at least 18 years old to create an account",
              "You must provide valid contact information",
              "You are responsible for all activities under your account",
              "You must notify us immediately of any unauthorized use",
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
      title: "User Roles and Responsibilities",
      content: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Customers:</h3>
            <ul className="space-y-2">
              {[
                "Provide accurate booking information",
                "Pay for services as agreed",
                "Communicate respectfully with professionals",
                "Provide honest reviews and ratings",
                "Cancel bookings according to our cancellation policy",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Professionals:</h3>
            <ul className="space-y-2">
              {[
                "Provide accurate service descriptions and pricing",
                "Complete services to professional standards",
                "Maintain valid verification documents",
                "Respond promptly to booking requests",
                "Adhere to our code of conduct",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      num: "04",
      title: "Services and Bookings",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>FixHub acts as a platform connecting customers with service professionals. We do not directly provide services.</p>
          <ul className="space-y-2">
            {[
              { label: "Service Descriptions", desc: "Professionals are responsible for accurate service descriptions" },
              { label: "Pricing", desc: "All prices are as listed by professionals unless otherwise agreed" },
              { label: "Booking Confirmation", desc: "Bookings are confirmed upon payment or professional acceptance" },
              { label: "Cancellations", desc: "Customers may cancel up to 24 hours before scheduled service without penalty" },
              { label: "Professional Cancellations", desc: "Professionals must provide reasonable notice for cancellations" },
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
      num: "05",
      title: "Payment Terms",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <ul className="space-y-2">
            {[
              "Payments are processed through secure payment gateways (eSewa, Khalti, etc.)",
              "Payments are held in escrow until service completion",
              "Refunds are processed according to our refund policy",
              "Professionals receive payment after successful service completion",
              "FixHub charges a commission on completed transactions",
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
      title: "Professional Verification",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>All professionals must undergo verification before offering services:</p>
          <ul className="space-y-2">
            {[
              "Submit valid identification documents",
              "Provide professional certifications if applicable",
              "Pass background checks where required",
              "Maintain active verification status",
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
      title: "Reviews and Ratings",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <ul className="space-y-2">
            {[
              "Reviews must be based on actual service experiences",
              "False or malicious reviews are prohibited",
              "Professionals cannot solicit fake reviews",
              "We reserve the right to remove inappropriate reviews",
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
      num: "08",
      title: "Prohibited Activities",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>Users are prohibited from:</p>
          <ul className="space-y-2">
            {[
              "Using the platform for illegal activities",
              "Harassing, threatening, or abusing other users",
              "Providing false information or misrepresenting identity",
              "Attempting to circumvent payment or commission fees",
              "Interfering with platform operations",
              "Creating multiple accounts without permission",
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
      num: "09",
      title: "Intellectual Property",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>FixHub and its original content, features, and functionality are owned by FixHub and are protected by international copyright, trademark, and other intellectual property laws.</p>
          <ul className="space-y-2">
            {[
              "You may not copy, modify, or distribute our content",
              "Professionals retain rights to their service descriptions and images",
              "User-generated content remains the property of the creator",
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
      num: "10",
      title: "Limitation of Liability",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>FixHub is not liable for:</p>
          <ul className="space-y-2">
            {[
              "Quality of services provided by professionals",
              "Direct or indirect damages from platform use",
              "Actions or omissions of users or professionals",
              "Technical issues or service interruptions",
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
      num: "11",
      title: "Dispute Resolution",
      content: (
        <p className="text-slate-600 text-sm leading-relaxed">
          Disputes between customers and professionals should first be resolved through our support system. If unresolved, disputes may be subject to binding arbitration in Kathmandu, Nepal.
        </p>
      ),
    },
    {
      num: "12",
      title: "Termination",
      content: (
        <p className="text-slate-600 text-sm leading-relaxed">
          FixHub reserves the right to terminate or suspend accounts that violate these terms. Users may also terminate their accounts at any time through their account settings.
        </p>
      ),
    },
    {
      num: "13",
      title: "Governing Law",
      content: (
        <p className="text-slate-600 text-sm leading-relaxed">
          These terms are governed by the laws of Nepal. Any legal action must be brought in courts located in Kathmandu, Nepal.
        </p>
      ),
    },
    {
      num: "14",
      title: "Contact Information",
      content: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p>For questions about these terms, please contact us at:</p>
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
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

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
            {/* Document icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(255,255,255,0.15)" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms &amp; Conditions</h1>
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
          <Link href="/privacy-policy" className="text-blue-500 hover:text-blue-700 font-medium transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
