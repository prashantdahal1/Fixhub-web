"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
  isError?: boolean;
}

/* ─── Fixie Identity: the •• mark ──────────────────────────────────────── */

/** Fixie launcher — two white dots, slow blink. Nothing else. */
const FixieDots = () => (
  <svg
    viewBox="0 0 44 18"
    className="w-full h-full"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>{`
      @keyframes fixie-blink {
        0%, 90%, 100% { transform: scaleY(1); }
        94%            { transform: scaleY(0.05); }
      }
      .fixie-dot   { transform-origin: center; animation: fixie-blink 4s infinite ease-in-out; }
      .fixie-dot-r { animation-delay: 0.1s; }
    `}</style>
    <circle cx="12" cy="9" r="6.5" fill="white" className="fixie-dot" />
    <circle cx="32" cy="9" r="6.5" fill="white" className="fixie-dot fixie-dot-r" />
  </svg>
);

/** Avatar mark used in message list (24 px container) */
const FixieAvatar = ({ thinking = false, error = false }: { thinking?: boolean; error?: boolean }) => {
  if (thinking) {
    // Three tiny pulsing dots in a row
    return (
      <div className="flex items-center gap-[3px]">
        <span className="w-[4px] h-[4px] rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-[4px] h-[4px] rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-[4px] h-[4px] rounded-full bg-blue-500 animate-bounce" />
      </div>
    );
  }
  if (error) {
    return (
      <svg viewBox="0 0 20 12" className="w-4 h-3" fill="none">
        {/* Worried eyes */}
        <circle cx="4" cy="8" r="3" fill="#1e3a8a" />
        <circle cx="16" cy="8" r="3" fill="#1e3a8a" />
        <path d="M2 3 L6 5" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 3 L14 5" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // Default: two calm dots
  return (
    <svg viewBox="0 0 20 10" className="w-4 h-2.5" fill="none">
      <style>{`
        @keyframes fixie-blink-sm {
          0%, 88%, 100% { transform: scaleY(1); }
          92%            { transform: scaleY(0.08); }
        }
        .fd { transform-origin: center; animation: fixie-blink-sm 5s infinite ease-in-out; }
        .fd2 { animation-delay: 0.08s; }
      `}</style>
      <circle cx="5" cy="5" r="3.5" fill="#2563eb" className="fd" />
      <circle cx="15" cy="5" r="3.5" fill="#2563eb" className="fd fd2" />
    </svg>
  );
};

/* ─── Main Widget ────────────────────────────────────────────────────────── */

import { useAuth } from "@/contexts/AuthContext";
import { FileText, MessageSquare, DollarSign } from "lucide-react";

export default function ChatbotWidget() {
  const { user } = useAuth();
  const isPro = user?.role === "professional";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          text: isPro
            ? "Hi, I'm FixHub Pro Copilot.\nI can help you draft client quotes, estimate job pricing, and write professional customer updates."
            : "Hi, I'm Fixie.\nI can help you book services, track requests, and answer questions.",
        },
      ]);
    }
  }, [isPro, messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmedText = textToSend?.trim();
    if (!trimmedText || isLoading) return;

    setError(null);
    const userMessage = { role: "user" as const, text: trimmedText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const payload = { message: trimmedText, history: updatedMessages, role: user?.role };

      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to get response from AI");
      }

      const resData = await response.json();

      if (resData.success && resData.data?.response) {
        setMessages((prev) => [
          ...prev,
          { role: "model" as const, text: resData.data.response },
        ]);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const errMsg = err?.message || "Something went wrong. Please try again.";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { role: "model" as const, text: `Sorry, I ran into an issue: ${errMsg}`, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    handleSend(text);
  };

  const handleReset = () => {
    if (window.confirm("Reset conversation?")) {
      setMessages([
        {
          role: "model",
          text: isPro
            ? "Hi, I'm FixHub Pro Copilot.\nI can help you draft client quotes, estimate job pricing, and write professional customer updates."
            : "Hi, I'm Fixie.\nI can help you book services, track requests, and answer questions.",
        },
      ]);
      setError(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => handleSend(suggestion);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">

      {/* ── Launcher Button ─────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Chat with Fixie"
          className="flex h-[46px] items-center gap-2 bg-white border border-slate-200 rounded-full pl-2 pr-4 py-1.5 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.08),0_8px_16px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.12),0_12px_20px_-8px_rgba(0,0,0,0.08)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {/* Brand dot marker wrapper */}
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            }}
          >
            <div className="w-[18px] h-[8px] flex items-center justify-center">
              <FixieDots />
            </div>
          </div>
          <span className="text-[12px] font-bold text-slate-800 tracking-tight select-none">Ask Fixie</span>
        </button>
      )}

      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="flex flex-col overflow-hidden rounded-2xl bg-white"
          style={{
            width: 348,
            height: 492,
            boxShadow: "0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
          >
            <div className="flex items-center gap-3">
              {/* Header avatar — small pill with the •• mark */}
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 34,
                  height: 34,
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div className="w-[22px] h-[14px]">
                  <svg viewBox="0 0 44 26" className="w-full h-full" fill="none">
                    <style>{`
                      @keyframes fixie-blink-h {
                        0%, 88%, 100% { transform: scaleY(1); }
                        92%            { transform: scaleY(0.08); }
                      }
                      .fdh { transform-origin: center; animation: fixie-blink-h 5s infinite ease-in-out; }
                      .fdh2 { animation-delay: 0.08s; }
                    `}</style>
                    <circle cx="12" cy="13" r="6" fill="white" className="fdh" />
                    <circle cx="32" cy="13" r="6" fill="white" className="fdh fdh2" />
                  </svg>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white leading-none tracking-wide">Fixie</p>
                <p className="text-[10px] text-blue-100 mt-0.5 leading-none">AI Assistant · FixHub</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={handleReset}
                title="Reset Chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:bg-white/15 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:bg-white/15 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#f8fafc" }}>
            {messages.map((msg, index) => {
              const isModel = msg.role === "model";
              return (
                <div
                  key={index}
                  className={`flex gap-2 ${isModel ? "justify-start" : "justify-end"}`}
                >
                  {isModel && (
                    <div
                      className="shrink-0 flex items-center justify-center rounded-full"
                      style={{
                        width: 28,
                        height: 28,
                        background: "white",
                        border: "1.5px solid #dbeafe",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <FixieAvatar error={msg.isError} />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                      isModel
                        ? "bg-white text-slate-800 rounded-2xl rounded-tl-sm"
                        : "text-white rounded-2xl rounded-tr-sm"
                    }`}
                    style={
                      isModel
                        ? { border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }
                        : { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }
                    }
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {!isModel && (
                    <div
                      className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        width: 28,
                        height: 28,
                        background: "linear-gradient(135deg, #64748b, #475569)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                      }}
                    >
                      U
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking state */}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    background: "white",
                    border: "1.5px solid #dbeafe",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <FixieAvatar thinking />
                </div>
                <div
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white rounded-2xl rounded-tl-sm"
                  style={{ border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                >
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {messages.length === 1 && !isLoading && (
              <div className="pl-9 pr-2 pt-1 space-y-1.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {isPro ? "Pro Copilot Actions" : "Suggestions"}
                </p>
                {(isPro
                  ? [
                      { label: "Draft a client quote for AC repair", text: "Draft a professional quote for AC repair" },
                      { label: "Estimate labor pricing for 3h job", text: "Calculate estimated pricing for 3 hours electrical work" },
                      { label: "Write a professional follow-up", text: "Write a professional message to follow up with a client" },
                    ]
                  : [
                      { label: "Find plumbing or electrical services", text: "Help me find the right service for my issue" },
                      { label: "How does escrow payment work?", text: "Explain how FixHub escrow payment works" },
                    ]
                ).map(({ label, text }) => (
                  <button
                    key={label}
                    onClick={() => handleSuggestionClick(text)}
                    className="w-full text-left text-[11.5px] font-medium text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-xl px-3 py-2 transition-all duration-150 cursor-pointer border border-blue-100 shadow-xs"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleFormSubmit}
            className="shrink-0 flex gap-2 p-3 bg-white"
            style={{ borderTop: "1px solid #f1f5f9" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Fixie..."
              disabled={isLoading}
              className="flex-1 rounded-xl border text-[12.5px] text-slate-800 placeholder-slate-400 px-3.5 py-2 outline-none transition-all"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid #2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                e.currentTarget.style.background = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid #e2e8f0";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#f8fafc";
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
