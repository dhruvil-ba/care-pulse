"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function MessageForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      sender_id: String(formData.get("sender_id") ?? ""),
      receiver_id: String(formData.get("receiver_id") ?? ""),
      message_content: String(formData.get("message_content") ?? ""),
      is_read: String(formData.get("is_read") ?? "false") === "true"
    };

    startTransition(async () => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "Unable to send message." });
        return;
      }

      setStatus({ type: "ok", message: "Message sent." });
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label className="space-y-1 text-sm text-slate-300">
        Sender User ID
        <Input name="sender_id" required placeholder="u-prov-001" />
      </label>
      <label className="space-y-1 text-sm text-slate-300">
        Receiver User ID
        <Input name="receiver_id" required placeholder="u-pat-001" />
      </label>
      <label className="space-y-1 text-sm text-slate-300">
        Read Status
        <Select name="is_read" defaultValue="false" required>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </Select>
      </label>
      <label className="space-y-1 text-sm text-slate-300 md:col-span-2 xl:col-span-3">
        Message
        <Textarea name="message_content" required />
      </label>
      <div className="md:col-span-2 xl:col-span-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send Message"}
        </Button>
        {status ? (
          <p className={`mt-2 text-sm ${status.type === "error" ? "text-rose-300" : "text-emerald-300"}`}>{status.message}</p>
        ) : null}
      </div>
    </form>
  );
}
