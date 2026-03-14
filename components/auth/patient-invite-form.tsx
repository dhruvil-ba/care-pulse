"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { acceptInvitation } from "@/app/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";
import { toast } from "@/components/ui/toaster";

export function PatientInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setInviteCode(code.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      toast.error("Supabase not configured", "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    startTransition(async () => {
      let userId: string | null = null;

      const { data, error } = await client.auth.signUp({
        email,
        password
      });

      if (error?.code === "user_already_exists") {
        const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
          email,
          password
        });

        if (signInError || !signInData.user) {
          toast.error("Sign in failed", signInError?.message ?? "Unable to sign in.");
          return;
        }

        userId = signInData.user.id;
      } else if (error || !data.user) {
        toast.error("Sign up failed", error?.message ?? "Unable to create account.");
        return;
      } else {
        userId = data.user.id;
      }

      const result = await acceptInvitation({
        invite_code: inviteCode,
        patient_id: userId,
        patient_email: email,
        patient_full_name: fullName
      });

      if (result?.error) {
        toast.error("Invite failed", result.error);
        return;
      }

      toast.success("Invite accepted", "Your account is linked to your care team.");
      router.push("/login");
    });
  };

  return (
    <Card className="border-white/10 bg-white/5 text-slate-100 shadow-glass">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold">Join via invite</CardTitle>
        <CardDescription className="text-slate-300">
          Enter the invite code from your provider to complete your Care Pulse signup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="invite_code">
              Invite code
            </label>
            <Input
              id="invite_code"
              name="invite_code"
              placeholder="A8F2K9"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              className="border-white/10 bg-slate-900/70 text-slate-100"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="full_name">
              Full name
            </label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Sarah Jenkins"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="border-white/10 bg-slate-900/70 text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@carepulse.health"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-white/10 bg-slate-900/70 text-slate-100"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-white/10 bg-slate-900/70 text-slate-100"
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
            {pending ? "Submitting..." : "Accept invite"}
          </Button>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <span>Already have access?</span>
            <Link className="text-emerald-200 hover:text-emerald-100" href="/login">
              Log in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
