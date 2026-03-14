"use client";

import { Patient } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function CarePlanForm({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      patient_id: String(formData.get("patient_id") ?? ""),
      provider_id: String(formData.get("provider_id") ?? ""),
      condition_name: String(formData.get("condition_name") ?? ""),
      status: String(formData.get("status") ?? "active") as "active" | "completed" | "suspended"
    };

    startTransition(async () => {
      const response = await fetch("/api/care-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "Unable to create care plan." });
        return;
      }

      setStatus({ type: "ok", message: "Care plan created." });
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.9)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/60">Plan Details</p>
            <p className="mt-1 text-sm text-slate-300">Capture the care protocol and current status.</p>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
            Core Plan
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Patient
            <Select name="patient_id" required defaultValue="" className="mt-1 text-sm">
              <option value="" disabled>
                Select patient
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Provider ID
            <Input name="provider_id" required placeholder="pr-001" className="mt-1 text-sm" />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:col-span-2 xl:col-span-3">
            Condition Name
            <Input name="condition_name" required placeholder="Type 2 Diabetes" className="mt-1 text-sm" />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Status
            <Select name="status" required defaultValue="active" className="mt-1 text-sm">
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="suspended">Suspended</option>
            </Select>
          </label>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
        <p className="text-xs text-slate-400">Changes are saved instantly for the patient care team.</p>
        <Button
          type="submit"
          disabled={pending}
          className="ml-auto h-12 rounded-2xl border border-emerald-300/80 bg-emerald-400 px-6 text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-950 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_26px_50px_-30px_rgba(16,185,129,0.95)]"
        >
          <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-200/80 text-lg text-slate-900">
            +
          </span>
          {pending ? "Saving..." : "Create Care Plan"}
        </Button>
      </div>
      {status ? (
        <p className={`text-sm ${status.type === "error" ? "text-rose-300" : "text-emerald-300"}`}>{status.message}</p>
      ) : null}
    </form>
  );
}
