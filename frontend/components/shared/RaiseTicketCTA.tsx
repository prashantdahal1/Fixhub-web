"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Ticket, Plus } from "lucide-react";

export default function RaiseTicketCTA() {
  const { user } = useAuth();

  const handleClick = () => {
    // dispatch global event to open the raise-ticket modal
    window.dispatchEvent(new Event('open-raise-ticket'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className="flex h-[46px] items-center gap-3 bg-white border border-slate-200 rounded-full pl-3 pr-4 py-1.5 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.08)]"
        aria-label="Raise a support ticket"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
          <Plus className="h-4 w-4" />
        </div>
        <span className="text-[13px] font-semibold text-slate-800">Raise Ticket</span>
      </button>
    </div>
  );
}
