"use client";

import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Send, Phone, Video, Search, CheckCheck, Paperclip } from "lucide-react";

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const INITIAL_CONTACTS: ChatContact[] = [];

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Record<string, Array<{ id: string; sender: string; text: string; time: string }>>>({});

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: "you",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (!selectedContact) return;

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: input.trim(), time: "Just now", unread: 0 }
          : c
      )
    );

    setInput("");
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  const currentMessages = selectedContact ? (messages[selectedContact.id] || []) : [];

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-[calc(100vh-100px)] flex bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* ── Left Sidebar (Contacts List) ────────────────────────────────── */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900">Messages &amp; Chat</h1>
            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
              {user?.role === "professional" ? "Pro Inbox" : "Customer Chat"}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60">
          {filteredContacts.map((contact) => {
            const isSelected = selectedContact?.id === contact.id;
            return (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  setContacts((prev) =>
                    prev.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c))
                  );
                }}
                className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                  isSelected ? "bg-blue-50/80 border-l-4 border-blue-600" : "hover:bg-slate-100/60"
                }`}
              >
                <div className="relative shrink-0">
                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover shadow-xs" />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900 truncate">{contact.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{contact.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{contact.role}</p>
                  <p className="text-[11px] text-slate-600 truncate mt-1">{contact.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          {selectedContact ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover" />
                {selectedContact.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 leading-tight">{selectedContact.name}</h2>
                <p className="text-[11px] text-slate-500 font-medium">{selectedContact.role} &nbsp;·&nbsp; {selectedContact.online ? "Online" : "Offline"}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-bold text-sm text-slate-900 leading-tight">No contact selected</h2>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <a href="tel:+1234567890" className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
          {currentMessages.map((msg) => {
            const isMe = msg.sender === "you";
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? "bg-[#2563EB] text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  </div>
  );
}
