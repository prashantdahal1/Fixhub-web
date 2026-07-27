"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { apiFetch } from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import { Send, Phone, Video, Search, CheckCheck, Paperclip } from "lucide-react";

interface BookingDoc {
  _id: string;
  status: string;
  scheduledAt: string;
  notes?: string;
  serviceId?: { title?: string } | string;
  customerId?: { firstName?: string; lastName?: string } | string;
  professionalId?: { firstName?: string; lastName?: string } | string;
}

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

interface ChatMessage {
  _id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

const INITIAL_CONTACTS: ChatContact[] = [];

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Record<string, Array<ChatMessage>>>({});
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact) return;

    const newMsg: ChatMessage = {
      _id: Date.now().toString(),
      bookingId: selectedContact.id,
      senderId: user?._id || 'me',
      senderName: 'You',
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: input.trim(), time: 'Just now', unread: 0 }
          : c
      )
    );

    setInput("");
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  const currentMessages = selectedContact ? (messages[selectedContact.id] || []) : [];

  useEffect(() => {
    const loadBookings = async () => {
      setLoadingContacts(true);
      try {
        const bookingRes = await apiFetch<{ data: BookingDoc[] }>(API.BOOKINGS.LIST);
        const bookings = bookingRes.data || [];
        const contacts = bookings.map((booking) => {
          const isPro = user?.role === 'professional';
          const otherParty = isPro ? booking.customerId : booking.professionalId;
          const name = (!otherParty || typeof otherParty === 'string')
            ? 'Conversation'
            : `${otherParty.firstName || ''} ${otherParty.lastName || ''}`.trim() || 'Conversation';
          return {
            id: booking._id,
            name,
            role: isPro ? 'Customer' : 'Professional',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=2563eb`,
            lastMessage: booking.notes || `Service: ${typeof booking.serviceId === 'string' ? 'Service' : booking.serviceId?.title || 'Service'}`,
            time: new Date(booking.scheduledAt).toLocaleDateString(),
            unread: 0,
            online: false,
          };
        });
        setContacts(contacts);
        if (contacts.length > 0) {
          setSelectedContact((prev) => prev || contacts[0]);
        }
      } catch (err: any) {
        console.error('Failed to load chat contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadBookings();
  }, [user]);

  useEffect(() => {
    if (!selectedContact) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await apiFetch<{ data: ChatMessage[] }>(API.CHAT.BY_BOOKING(selectedContact.id));
        setMessages((prev) => ({
          ...prev,
          [selectedContact.id]: response.data,
        }));
      } catch (err: any) {
        console.error('Failed to load chat messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedContact]);

  return (
    <div className="w-full h-[calc(100vh-110px)] flex bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* ── Left Sidebar (Contacts List) ────────────────────────────────── */}
      <div className="w-80 border-r border-slate-200/70 flex flex-col bg-slate-50/50 shrink-0">
        <div className="p-4 border-b border-slate-200/70 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-slate-900">Messages &amp; Chat</h1>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
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
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingContacts ? (
            <div className="p-5 text-xs text-slate-400 text-center font-medium">Loading chat contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-5 text-xs text-slate-400 text-center font-medium">
              No conversations found.
            </div>
          ) : (
            filteredContacts.map((contact) => {
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
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-all relative ${
                    isSelected ? "bg-white shadow-xs z-10" : "hover:bg-slate-100/60"
                  }`}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />}
                  <div className="relative shrink-0">
                    <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover shadow-xs border border-slate-200/60" />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-bold text-xs truncate ${isSelected ? "text-blue-900" : "text-slate-900"}`}>{contact.name}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{contact.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{contact.role}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{contact.lastMessage}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/70 flex items-center justify-between bg-white shrink-0">
          {selectedContact ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={selectedContact.avatar} alt={selectedContact.name} className="w-9 h-9 rounded-full object-cover border border-slate-200/60" />
                {selectedContact.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 leading-tight">{selectedContact.name}</h2>
                <p className="text-[11px] text-slate-400 font-medium">{selectedContact.role} &nbsp;·&nbsp; <span className={selectedContact.online ? "text-emerald-600 font-semibold" : "text-slate-400"}>{selectedContact.online ? "Online" : "Offline"}</span></p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-bold text-sm text-slate-900 leading-tight">Select a conversation</h2>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <a href="tel:+1234567890" className="w-8 h-8 rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors" title="Call">
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {loadingMessages ? (
            <div className="flex justify-center py-10 text-xs text-slate-400">Loading messages...</div>
          ) : currentMessages.length === 0 ? (
            <div className="flex justify-center py-10 text-xs text-slate-400">No messages yet. Send a message to start the conversation.</div>
          ) : (
            currentMessages.map((msg) => {
              const isMe = msg.senderId === user?._id;
              return (
                <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-[#2563EB] text-white rounded-br-xs"
                        : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Input Form */}
        <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200/70 flex items-center gap-2 bg-white shrink-0 pr-36 sm:pr-44">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
