"use client";

import { Patient } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function MedicationForm({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      patient_id: String(formData.get("patient_id") ?? ""),
      name: String(formData.get("name") ?? ""),
      dosage: String(formData.get("dosage") ?? ""),
      frequency: String(formData.get("frequency") ?? ""),
      is_active: String(formData.get("is_active") ?? "true") === "true"
    };

    startTransition(async () => {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "Unable to add medication." });
        return;
      }

      setStatus({ type: "ok", message: "Medication added." });
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.9)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/60">Medication Setup</p>
            <p className="mt-1 text-sm text-slate-300">Track dosage, frequency, and adherence status.</p>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
            Rx Profile
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
            Medication Name
            <Input name="name" required className="mt-1 text-sm" />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Dosage
            <Input name="dosage" required placeholder="20 mg" className="mt-1 text-sm" />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Frequency
            <Input name="frequency" required placeholder="Once daily" className="mt-1 text-sm" />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Active
            <Select name="is_active" defaultValue="true" required className="mt-1 text-sm">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </label>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
        <p className="text-xs text-slate-400">Medication changes sync with the patient timeline.</p>
        <Button
          type="submit"
          disabled={pending}
          className="ml-auto h-12 rounded-2xl border border-emerald-300/80 bg-emerald-400 px-6 text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-950 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_26px_50px_-30px_rgba(16,185,129,0.95)]"
        >
          <span className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-200/80 text-lg text-slate-900">
            +
          </span>
          {pending ? "Saving..." : "Add Medication"}
        </Button>
      </div>
      {status ? (
        <p className={`text-sm ${status.type === "error" ? "text-rose-300" : "text-emerald-300"}`}>{status.message}</p>
      ) : null}
    </form>
  );
}
