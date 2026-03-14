"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back" : "Create your account";
  const description = isLogin
    ? "Sign in to access your Care Pulse workspace."
    : "Start your Care Pulse trial with secure access in minutes.";

  const alternate: { label: string; action: string; href: Route } = isLogin
    ? { label: "Need an account?", action: "Sign up", href: "/provider/signup" }
    : { label: "Already have an account?", action: "Log in", href: "/login" };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.refresh();
          router.push("/analytics");
        }
      } else {
        const emailRedirectTo = `${window.location.origin}/login`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo }
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data.user && !data.session) {
          setMessage("Check your email to confirm your account, then log in.");
        } else {
          router.refresh();
          router.push("/analytics");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 text-slate-100 shadow-glass">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-slate-300">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400" htmlFor="email">
              Work email
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
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Enter your password" : "Create a strong password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-white/10 bg-slate-900/70 text-slate-100"
              required
            />
          </div>

          {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
          {message ? <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">{message}</p> : null}

          <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Log in" : "Create account"}
          </Button>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <span>{alternate.label}</span>
            <Link className="text-emerald-200 hover:text-emerald-100" href={alternate.href}>
              {alternate.action}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
