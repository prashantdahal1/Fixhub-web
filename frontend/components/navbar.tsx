'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  showLinks?: boolean;
}

export default function Navbar({ showLinks = true }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/fixhub.png"
            alt="FixHub"
            width={100}
            height={32}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </Link>

        {showLinks && (
          <>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
              <Link href="/#services" className="hover:text-blue-600 transition-colors">Services</Link>
              <Link href="/#how" className="hover:text-blue-600 transition-colors">How it works</Link>
              <Link href="/#reviews" className="hover:text-blue-600 transition-colors">Reviews</Link>
              <Link href="/#faq" className="hover:text-blue-600 transition-colors">FAQ</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-4 py-2">
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/20"
              >
                Get started
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-slate-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        )}

        {!showLinks && (
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-4 py-2">
              Back to Home
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {showLinks && mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-4 space-y-3">
          <Link href="/#services" className="block text-sm font-medium text-slate-600 py-2" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link href="/#how" className="block text-sm font-medium text-slate-600 py-2" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
          <Link href="/#reviews" className="block text-sm font-medium text-slate-600 py-2" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" className="text-sm font-medium text-slate-500 text-center py-2" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link href="/register" className="text-sm font-semibold bg-blue-600 text-white text-center py-2.5 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
