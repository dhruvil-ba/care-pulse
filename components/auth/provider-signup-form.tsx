"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";
import { toast } from "@/components/ui/toaster";
import { createProviderProfile } from "@/app/actions/provider-signup";

export function ProviderSignupForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      toast.error("Supabase not configured", "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    startTransition(async () => {
      const { data, error } = await client.auth.signUp({
        email,
        password
      });

      if (error || !data.user) {
        toast.error("Sign up failed", error?.message ?? "Unable to create account.");
        return;
      }

      const profileResult = await createProviderProfile({
        user_id: data.user.id,
        email,
        full_name: fullName
      });

      if ("error" in profileResult) {
        toast.error("Profile setup failed", profileResult.error);
        return;
      }

      toast.success("Provider account created", "You can now invite patients.");
      router.push("/provider/invitations");
    });
  };

  return (
    <Card className="border-white/10 bg-white/5 text-slate-100 shadow-glass">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold">Provider sign up</CardTitle>
        <CardDescription className="text-slate-300">
          Create a provider account to start inviting patients into Care Pulse.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="full_name">
              Full name
            </label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Dr. Anita Rao"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="border-white/10 bg-slate-900/70 text-slate-100"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="email">
              Work email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="provider@carepulse.health"
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
            {pending ? "Creating..." : "Create provider account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
