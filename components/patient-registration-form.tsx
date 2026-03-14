"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function PatientRegistrationForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      first_name: String(formData.get("first_name") ?? ""),
      last_name: String(formData.get("last_name") ?? ""),
      date_of_birth: String(formData.get("date_of_birth") ?? ""),
      contact_number: String(formData.get("contact_number") ?? ""),
      risk_level: String(formData.get("risk_level") ?? "low") as "low" | "medium" | "high"
    };

    startTransition(async () => {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "Registration failed. Check required fields." });
        return;
      }

      setStatus({ type: "ok", message: "Patient registered successfully." });
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label className="space-y-1 text-sm text-slate-300">
        First Name
        <Input name="first_name" required />
      </label>
      <label className="space-y-1 text-sm text-slate-300">
        Last Name
        <Input name="last_name" required />
      </label>
      <label className="space-y-1 text-sm text-slate-300">
        Date of Birth
        <Input name="date_of_birth" type="date" required />
      </label>
      <label className="space-y-1 text-sm text-slate-300">
        Contact Number
        <Input name="contact_number" placeholder="+1 555-0100" />
      </label>
      <label className="space-y-1 text-sm text-slate-300">
        Risk Level
        <Select name="risk_level" required defaultValue="low">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </label>
      <div className="md:col-span-2 xl:col-span-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Register Patient"}
        </Button>
        {status ? (
          <p className={`mt-2 text-sm ${status.type === "error" ? "text-rose-300" : "text-emerald-300"}`}>{status.message}</p>
        ) : null}
      </div>
    </form>
  );
}
