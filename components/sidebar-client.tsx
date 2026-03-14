"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  MailPlus,
  MessageSquareText,
  Pill,
  ShieldCheck,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const baseLinks: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/care-plans", label: "Care Plans", icon: ClipboardList },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/messages", label: "Messaging", icon: MessageSquareText }
];

const providerOnlyLinks: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/invitations", label: "Invitations", icon: MailPlus }
];

type SidebarClientProps = {
  role: "provider" | "patient" | null;
};

export function SidebarClient({ role }: SidebarClientProps) {
  const pathname = usePathname();
  const links = role === "provider" ? [...baseLinks, ...providerOnlyLinks] : baseLinks;
  const summary = role === "provider"
    ? {
        badge: "Provider mode",
        title: "Operational pulse",
        body: "Care-plan approvals, patient response loops, and medication adherence stay visible from one rail.",
        stats: [
          { value: "24", label: "active plans" },
          { value: "8", label: "tasks due" }
        ]
      }
    : {
        badge: "Patient mode",
        title: "Today at a glance",
        body: "Track your care cadence, medication flow, and upcoming check-ins without leaving the dashboard.",
        stats: [
          { value: "92%", label: "adherence" },
          { value: "1", label: "visit upcoming" }
        ]
      };

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/6 px-4 py-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-emerald-300/80">
          {summary.badge}
        </p>
        <h3 className="mt-2 text-sm font-semibold text-white">{summary.title}</h3>
        <p className="mt-1 text-[11px] leading-5 text-slate-300">{summary.body}</p>
      </div>

      <nav aria-label="Primary" className="space-y-2">
        <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">Workspace</p>
        <div className="grid gap-1">
          {links.map((link) => {
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
      </nav>

      <div className="mt-auto shrink-0 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
        <div className="flex items-center gap-2 text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/90">Care signal</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {summary.stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/6 bg-slate-950/40 px-3 py-2">
              <p className="text-base font-semibold text-white">{item.value}</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-400/12 bg-emerald-400/6 px-3 py-2.5">
          <HeartPulse className="h-4 w-4 text-emerald-300" />
          <p className="text-[11px] leading-5 text-slate-300">Trendline healthy and response loop on track.</p>
        </div>
      </div>
    </div>
  );
}
