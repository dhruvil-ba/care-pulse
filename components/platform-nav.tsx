"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links: Array<{ href: Route; label: string }> = [
  { href: "/analytics", label: "Analytics" },
  { href: "/patients", label: "Patients" },
  { href: "/care-plans", label: "Care Plans" },
  { href: "/appointments", label: "Appointments" },
  { href: "/medications", label: "Medications" },
  { href: "/messages", label: "Messaging" }
];

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="mt-4 grid gap-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
              isActive && "bg-emerald-400/15 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
