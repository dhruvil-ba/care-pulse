"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { invitePatient } from "@/app/actions/invite-patient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const carePlanOptions = ["Diabetes", "Hypertension", "General"] as const;

export function NewPatientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [email, setEmail] = useState("");
  const [carePlan, setCarePlan] = useState<(typeof carePlanOptions)[number]>("General");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetState = () => {
    setStep("form");
    setEmail("");
    setCarePlan("General");
    setInviteCode("");
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.set("email", email.trim());
      payload.set("carePlan", carePlan);

      const result = await invitePatient(payload);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.inviteCode) {
        setInviteCode(result.inviteCode);
        setStep("success");
      }
    });
  };

  const handleDone = () => {
    setOpen(false);
    router.refresh();
    resetState();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      // Ignore clipboard errors for now.
    }
    handleDone();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ New Patient</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "form" ? "Invite a new patient" : "Invite code ready"}</DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Generate a secure invite code for a new patient."
              : "Share this one-time code with the patient to complete onboarding."}
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="patient-email">Email</FieldLabel>
                <Input
                  id="patient-email"
                  name="patient-email"
                  type="email"
                  placeholder="patient@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(error)}
                  required
                />
                {error ? <FieldDescription className="text-danger">{error}</FieldDescription> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="care-plan">Initial Care Plan</FieldLabel>
                <Select
                  id="care-plan"
                  name="care-plan"
                  value={carePlan}
                  onChange={(event) => setCarePlan(event.target.value as (typeof carePlanOptions)[number])}
                >
                  {carePlanOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                Generate Invite Code
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Invite Code</div>
              <div className="mt-4 text-4xl font-semibold tracking-[0.4em] text-foreground">{inviteCode}</div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCopy}>
                Copy to Clipboard
              </Button>
              <Button type="button" onClick={handleDone}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
