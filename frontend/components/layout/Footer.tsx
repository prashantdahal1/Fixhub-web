import Link from "next/link";
import { Mail, MapPin, Wrench } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4">FixHub</h3>
            <p className="text-sm leading-relaxed mb-4">
              Your trusted platform for connecting with skilled professionals for all your home service needs.
            </p>
            <p className="text-xs text-slate-400">
              © 2026 FixHub. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/services?category=electrician" className="hover:text-white transition-colors">
                  Electrician
                </Link>
              </li>
              <li>
                <Link href="/dashboard/services?category=plumber" className="hover:text-white transition-colors">
                  Plumber
                </Link>
              </li>
              <li>
                <Link href="/dashboard/services?category=ac_repair" className="hover:text-white transition-colors">
                  AC Repair
                </Link>
              </li>
              <li>
                <Link href="/dashboard/services?category=carpenter" className="hover:text-white transition-colors">
                  Carpenter
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-xs text-slate-400">
          <p>Made with ❤️ in Nepal | Connecting you with the best professionals</p>
        </div>
      </div>
    </footer>
  );
}
