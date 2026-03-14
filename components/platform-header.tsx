"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/analytics": {
    title: "Population Analytics",
    subtitle: "Operational pulse across chronic cohorts"
  },
  "/patients": {
    title: "Patients",
    subtitle: "Register and monitor population health"
  },
  "/care-plans": {
    title: "Care Plans",
    subtitle: "Configure active protocols and goals"
  },
  "/core-plans": {
    title: "Care Plans",
    subtitle: "Configure active protocols and goals"
  },
  "/appointments": {
    title: "Appointments",
    subtitle: "Coordinate provider follow-ups"
  },
  "/medications": {
    title: "Medications",
    subtitle: "Track prescriptions and adherence"
  },
  "/messages": {
    title: "Messaging",
    subtitle: "Care team communications"
  },
  "/provider/invitations": {
    title: "Invitations",
    subtitle: "Invite patients to your care team"
  },
  "/profile": {
    title: "Profile",
    subtitle: "Account details"
  }
};

export function PlatformHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const normalizedPathname = useMemo(() => {
    return pathname.replace(/\/$/, "").replace(/^\/provider/, "");
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      if (!supabase) {
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!mounted) {
        return;
      }
      setEmail(data.user?.email ?? null);
      setFullName((data.user?.user_metadata?.full_name as string | undefined) ?? null);
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const label = titleMap[normalizedPathname] ?? {
    title: "Care Pulse",
    subtitle: "Population health command center"
  };

  const initials = useMemo(() => {
    if (fullName) {
      return fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "CP";
  }, [fullName, email]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="relative z-40 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label.subtitle}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{label.title}</h1>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-300/40"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-100">
            {initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</span>
            <span className="block text-sm text-white">{fullName ?? email ?? "Provider"}</span>
          </span>
        </button>

        {menuOpen ? (
          <div className="absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-glass backdrop-blur">
            <div className="px-3 py-2 text-xs text-slate-400">
              <div className="uppercase tracking-[0.2em]">Account</div>
              <div className="mt-1 text-sm text-slate-200">{email ?? "unknown"}</div>
            </div>
            <Link
              href="/profile"
              className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              View profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-500/10"
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
