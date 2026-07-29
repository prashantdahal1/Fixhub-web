"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    danger: <AlertCircle className="h-6 w-6 text-red-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    info: <Info className="h-6 w-6 text-blue-500" />,
  };

  const ringMap = {
    danger: "bg-red-50 ring-8 ring-red-50/50",
    warning: "bg-amber-50 ring-8 ring-amber-50/50",
    info: "bg-blue-50 ring-8 ring-blue-50/50",
  };

  const btnMap = {
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
    warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
    info: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${ringMap[variant]}`}>
          {iconMap[variant]}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed px-2 mb-6">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${btnMap[variant]}`}
          >
            {isLoading ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
