import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "FixHub — Instant Home Solutions",
  description: "Book trusted local professionals for home repairs and maintenance.",
  icons: {
    icon: "/images/fixhub_icon.png",
    shortcut: "/images/fixhub_icon.png",
    apple: "/images/fixhub_icon.png",
  },
};

import { AuthProvider } from "../contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatbotWidget from "@/components/shared/ChatbotWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-[family-name:var(--font-geist)] antialiased min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
