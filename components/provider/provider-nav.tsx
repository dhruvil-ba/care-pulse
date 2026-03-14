"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  MailPlus,
  MessageSquareText,
  Pill,
  ShieldCheck,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const coreLinks: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: "/provider/analytics", label: "Analytics", icon: Activity },
  { href: "/provider/patients", label: "Patients", icon: Users },
  { href: "/provider/care-plans", label: "Care Plans", icon: ClipboardList },
  { href: "/provider/appointments", label: "Appointments", icon: CalendarDays }
];

const supportLinks: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: "/provider/medications", label: "Medications", icon: Pill },
  { href: "/provider/messaging", label: "Messaging", icon: MessageSquareText },
  { href: "/provider/invitations", label: "Invitations", icon: MailPlus }
];

export function ProviderNav() {
  const pathname = usePathname();

  return (
    <div className="mt-4 flex h-full min-h-0 flex-col gap-4">
      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/6 px-4 py-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-emerald-300/80">
          Provider workspace
        </p>
        <h3 className="mt-2 text-sm font-semibold text-white">Daily command flow</h3>
        <p className="mt-1 text-[11px] leading-5 text-slate-300">
          Monitor cohorts, follow up on pending outreach, and keep patient operations moving from one control rail.
        </p>
      </div>

      <nav aria-label="Provider navigation" className="space-y-3">
        <div className="space-y-2">
          <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">Core</p>
          <div className="grid gap-1">
            {coreLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white",
                    isActive && "bg-emerald-400/15 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-slate-400 transition group-hover:border-emerald-300/30 group-hover:bg-emerald-400/10 group-hover:text-emerald-200",
                      isActive && "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{link.label}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-slate-600 transition group-hover:text-slate-300",
                      isActive && "text-emerald-200"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">Follow-up</p>
          <div className="grid gap-1">
            {supportLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white",
                    isActive && "bg-emerald-400/15 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-slate-400 transition group-hover:border-emerald-300/30 group-hover:bg-emerald-400/10 group-hover:text-emerald-200",
                      isActive && "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{link.label}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-slate-600 transition group-hover:text-slate-300",
                      isActive && "text-emerald-200"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mt-auto mb-2 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
        <div className="flex items-center gap-2 text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/90">Shift summary</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/6 bg-slate-950/40 px-3 py-2">
            <p className="text-base font-semibold text-white">18</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">patients active</p>
          </div>
          <div className="rounded-xl border border-white/6 bg-slate-950/40 px-3 py-2">
            <p className="text-base font-semibold text-white">6</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">invites pending</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-emerald-400/12 bg-emerald-400/6 px-3 py-2.5">
          <p className="text-[11px] leading-5 text-slate-300">Invites, plans, and outreach queues are stable.</p>
        </div>
      </div>
    </div>
  );
}
