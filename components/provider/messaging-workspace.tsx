"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MessagingContact } from "@/lib/messaging-data";
import type { CommunicationLog } from "@/lib/types";

type MessagingWorkspaceProps = {
  providerId: string;
  contacts: MessagingContact[];
  initialMessages: CommunicationLog[];
};

const quickReplies = [
  "Thanks for the update. Please continue logging your readings daily.",
  "I reviewed your last numbers. Let's keep this plan for the next 48 hours.",
  "Noted. I have added this to your care timeline for follow-up.",
  "Please confirm symptoms are stable and continue hydration as advised."
];

type ConversationPreview = {
  contact: MessagingContact;
  lastMessage: CommunicationLog | null;
  unreadCount: number;
};

function getRiskBadgeStyles(risk: MessagingContact["riskLevel"]) {
  if (risk === "high") {
    return "border-rose-300/30 bg-rose-400/15 text-rose-200";
  }
  if (risk === "medium") {
    return "border-amber-300/30 bg-amber-300/15 text-amber-100";
  }
  return "border-emerald-300/30 bg-emerald-400/15 text-emerald-200";
}

export function MessagingWorkspace({ providerId, contacts, initialMessages }: MessagingWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [typingContactId, setTypingContactId] = useState<string | null>(null);
  const endOfThreadRef = useRef<HTMLDivElement | null>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const previews = useMemo<ConversationPreview[]>(() => {
    return contacts
      .map((contact) => {
        const thread = messages
          .filter(
            (message) =>
              (message.sender_id === providerId && message.receiver_id === contact.userId) ||
              (message.sender_id === contact.userId && message.receiver_id === providerId)
          )
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const lastMessage = thread.length > 0 ? thread[thread.length - 1] : null;
        const unreadCount = thread.filter((message) => message.sender_id === contact.userId && !message.is_read).length;

        return {
          contact,
          lastMessage,
          unreadCount
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
  }, [contacts, messages, providerId]);

  const filteredPreviews = previews.filter((preview) => {
    if (!query.trim()) {
      return true;
    }

    const normalized = query.trim().toLowerCase();
    return (
      preview.contact.displayName.toLowerCase().includes(normalized) || preview.contact.email.toLowerCase().includes(normalized)
    );
  });

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedContactId && filteredPreviews.some((preview) => preview.contact.userId === selectedContactId)) {
      return;
    }

    setSelectedContactId(filteredPreviews[0]?.contact.userId ?? null);
  }, [filteredPreviews, selectedContactId]);

  const activeContact = filteredPreviews.find((preview) => preview.contact.userId === selectedContactId)?.contact ?? null;

  const activeThread = messages
    .filter(
      (message) =>
        activeContact &&
        ((message.sender_id === providerId && message.receiver_id === activeContact.userId) ||
          (message.sender_id === activeContact.userId && message.receiver_id === providerId))
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  useEffect(() => {
    endOfThreadRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeThread.length, typingContactId, selectedContactId]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  function sendMessage() {
    if (!activeContact || !draft.trim()) {
      return;
    }

    const createdAt = new Date().toISOString();
    const outgoingMessage: CommunicationLog = {
      id: `msg-local-${Date.now()}`,
      sender_id: providerId,
      receiver_id: activeContact.userId,
      message_content: draft.trim(),
      is_read: true,
      created_at: createdAt
    };

    setMessages((prev) => [...prev, outgoingMessage]);
    setDraft("");
    setTypingContactId(activeContact.userId);

    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
    }

    replyTimerRef.current = setTimeout(() => {
      const reply: CommunicationLog = {
        id: `msg-local-reply-${Date.now()}`,
        sender_id: activeContact.userId,
        receiver_id: providerId,
        message_content: quickReplies[Math.floor(Math.random() * quickReplies.length)],
        is_read: false,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, reply]);
      setTypingContactId(null);
    }, 900);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="glass-card rounded-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Patient Inbox</h3>
            <p className="text-xs text-slate-400">{filteredPreviews.length} active conversations</p>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
            Live
          </span>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patient"
            className="border-white/10 bg-slate-950/50 pl-9 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </label>

        <div className="mt-4 max-h-[65vh] space-y-1.5 overflow-y-auto pr-1">
          {filteredPreviews.map((preview) => {
            const isSelected = preview.contact.userId === selectedContactId;

            return (
              <button
                key={preview.contact.userId}
                type="button"
                onClick={() => setSelectedContactId(preview.contact.userId)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-2.5 text-left transition",
                  isSelected
                    ? "border-emerald-300/30 bg-emerald-400/12"
                    : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{preview.contact.displayName}</p>
                    <p className="truncate text-xs text-slate-400">{preview.contact.email}</p>
                  </div>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]", getRiskBadgeStyles(preview.contact.riskLevel))}>
                    {preview.contact.riskLevel}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-400">
                    {preview.lastMessage ? preview.lastMessage.message_content : "No messages yet"}
                  </p>
                  {preview.unreadCount > 0 ? (
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                      {preview.unreadCount}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
          {filteredPreviews.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">No matching patients.</p>
          ) : null}
        </div>
      </section>

      <section className="glass-card flex min-h-[72vh] flex-col rounded-3xl">
        {activeContact ? (
          <>
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{activeContact.displayName}</h3>
                <p className="text-xs text-slate-400">{activeContact.email}</p>
              </div>
              <div className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Active thread
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {activeThread.map((message) => {
                const isOutgoing = message.sender_id === providerId;

                return (
                  <div key={message.id} className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2.5",
                        isOutgoing
                          ? "rounded-br-md border border-emerald-300/25 bg-emerald-400/15 text-emerald-50"
                          : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-100"
                      )}
                    >
                      <p className="text-sm leading-6">{message.message_content}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typingContactId === activeContact.userId ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-300">
                    {activeContact.displayName.split(" ")[0]} is typing...
                  </div>
                </div>
              ) : null}
              <div ref={endOfThreadRef} />
            </div>

            <footer className="border-t border-white/10 px-5 py-4">
              <div className="flex items-end gap-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Message ${activeContact.displayName.split(" ")[0]}`}
                  className="h-11 border-white/10 bg-slate-950/50 text-sm text-slate-100 placeholder:text-slate-500"
                />
                <Button type="button" onClick={sendMessage} className="h-11 px-4">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
            <p className="text-sm text-slate-400">No conversation selected.</p>
          </div>
        )}
      </section>
    </div>
  );
}
