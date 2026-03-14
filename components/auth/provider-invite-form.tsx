"use client";

import { useMemo, useState, useTransition } from "react";
import { createInvitation } from "@/app/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function ProviderInviteForm() {
  const [pending, startTransition] = useTransition();
  const [providerId, setProviderId] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const inviteLink = useMemo(() => {
    if (!inviteCode || typeof window === "undefined") {
      return null;
    }
    return `${window.location.origin}/invite?code=${inviteCode}`;
  }, [inviteCode]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createInvitation({ provider_id: providerId, patient_email: patientEmail });

      if ("error" in result) {
        toast.error("Invite failed", result.error);
        return;
      }

      setInviteCode(result.data.invite_code);
      toast.success("Invite created", `Code: ${result.data.invite_code}`);
    });
  };

  const handleCopy = async () => {
    if (!inviteLink) {
      return;
    }
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied", "Paste it into an email to your patient.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="provider_id">
        Provider ID
      </label>
      <Input
        id="provider_id"
        name="provider_id"
        placeholder="pr-001"
        value={providerId}
        onChange={(event) => setProviderId(event.target.value)}
        className="border-white/10 bg-slate-900/70 text-slate-100"
        required
      />

      <label className="block text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="patient_email">
        Patient Email
      </label>
      <Input
        id="patient_email"
        name="patient_email"
        type="email"
        placeholder="patient@carepulse.health"
        value={patientEmail}
        onChange={(event) => setPatientEmail(event.target.value)}
        className="border-white/10 bg-slate-900/70 text-slate-100"
        required
      />

      <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
        {pending ? "Generating..." : "Generate Invite"}
      </Button>

      {inviteCode ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <div>
            Invite code created: <span className="font-semibold">{inviteCode}</span>
          </div>
          {inviteLink ? (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-emerald-100/80">Share: {inviteLink}</div>
              <Button type="button" variant="secondary" className="rounded-full" onClick={handleCopy}>
                Copy invite link
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
