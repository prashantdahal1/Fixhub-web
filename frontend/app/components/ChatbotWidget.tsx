"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! I'm your FixHub AI Assistant. Ask me anything about home repairs, plumbing, electrical issues, or how to navigate our platform!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput("");
    setError(null);

    // 1. Add User message to the messages list
    const updatedMessages = [...messages, { role: "user" as const, text: userMessageText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 2. Prepare payload
      // According to MERN way, we send the entire array to the backend so Gemini keeps context.
      // We pass the new message separately or keep history up to the previous message.
      // The backend handles history by starting a chat with `history` (excluding the new user message)
      // and then sending the new `message`.
      const payload = {
        message: userMessageText,
        // send history before the user sent the new message
        history: messages,
      };

      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([
        {
          role: "model",
          text: "Chat history cleared. How can I assist you now?",
        },
      ]);
      setError(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/20 active:scale-95"
          aria-label="Open Chatbot"
        >
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500"></span>
          </span>
          <MessageSquare className="h-5.5 w-5.5 transition-transform group-hover:rotate-3" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-[480px] w-[330px] flex-col overflow-hidden rounded-2xl border border-gray-150/80 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 sm:w-[360px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Bot className="h-4.5 w-4.5 text-sky-100" />
              </div>
              <div>
                <h3 className="flex items-center gap-1 font-semibold text-xs leading-none tracking-wide text-white">
                  FixHub AI Assistant
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                </h3>
                <span className="text-[9px] text-sky-100/90 leading-none">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset Chat"
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3.5 space-y-3 dark:bg-zinc-950/20">
            {messages.map((msg, index) => {
              const isModel = msg.role === "model";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${isModel ? "justify-start" : "justify-end"}`}
                >
                  {isModel && (
                    <div className="flex h-7.5 w-7.5 shrink-0 select-none items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                      isModel
                        ? "bg-white text-slate-800 border border-slate-100 dark:bg-zinc-800 dark:text-slate-100 dark:border-zinc-700/40 rounded-tl-xs"
                        : "bg-indigo-600 text-white rounded-tr-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  {!isModel && (
                    <div className="flex h-7.5 w-7.5 shrink-0 select-none items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[80%] rounded-xl rounded-tl-xs bg-white border border-slate-100 px-3.5 py-2.5 shadow-2xs dark:bg-zinc-800 dark:border-zinc-700/40">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-[11px] text-red-600 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400">
                <p className="font-semibold">Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <form
            onSubmit={handleSend}
            className="border-t border-gray-150/70 p-2.5 bg-white dark:border-zinc-850 dark:bg-zinc-900 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
