import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PatientDetailSnapshot } from "@/lib/patient-detail-data";

function toneClass(tone: "stable" | "warning" | "improving") {
  if (tone === "warning") {
    return "border-warning/30 bg-warning/10 text-warning-foreground";
  }
  if (tone === "improving") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  }
  return "border-white/10 bg-white/5 text-slate-100";
}

function chartColor(index: number) {
  return ["#6ee7b7", "#34d399", "#fbbf24", "#38bdf8", "#22c55e", "#c084fc"][index % 6];
}

function MiniTrendChart({
  title,
  unit,
  points,
  accent
}: {
  title: string;
  unit: string;
  points: Array<{ label: string; value: number }>;
  accent: string;
}) {
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const range = Math.max(1, max - min);
  const line = points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 72 - 14;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-white/10 bg-gradient-to-br from-slate-950/70 to-transparent">
        <CardTitle className="text-lg text-white">{title}</CardTitle>
        <CardDescription className="text-slate-400">6-month rolling observation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold text-white">
              {points[points.length - 1]?.value}
              <span className="ml-2 text-sm text-slate-400">{unit}</span>
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Latest</div>
          </div>
          <div className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em]" style={{ borderColor: accent, color: accent }}>
            Trend
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <svg viewBox="0 0 100 100" className="h-40 w-full">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
                <stop offset="100%" stopColor={accent} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={`url(#gradient-${title})`}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={line}
            />
            {points.map((point, index) => {
              const x = (index / Math.max(1, points.length - 1)) * 100;
              const y = 100 - ((point.value - min) / range) * 72 - 14;
              return <circle key={point.label} cx={x} cy={y} r="2.4" fill={accent} />;
            })}
          </svg>
          <div className="mt-3 grid grid-cols-6 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-slate-500">
            {points.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientDetailView({
  snapshot,
  backHref
}: {
  snapshot: PatientDetailSnapshot;
  backHref: Route;
}) {
  return (
    <main className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="grid gap-6 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.88),rgba(15,23,42,0.6))] px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <Button asChild type="button" variant="secondary" size="sm" className="w-fit">
              <Link href={backHref}>
                <ArrowLeft data-icon="inline-start" />
                Back
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={snapshot.riskLevel === "High" ? "danger" : snapshot.riskLevel === "Medium" ? "warning" : "success"}>
                {snapshot.riskLevel} Risk
              </Badge>
              <Badge variant={snapshot.status === "Active" ? "success" : "warning"}>{snapshot.status}</Badge>
            </div>
            <div>
              <CardTitle className="text-3xl text-white">{snapshot.name}</CardTitle>
              <CardDescription className="mt-2 text-base text-slate-300">
                {snapshot.email} · Age {snapshot.age} · Care plan: {snapshot.carePlan}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              {snapshot.conditions.map((condition, index) => (
                <span
                  key={condition}
                  className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em]"
                  style={{ borderColor: chartColor(index), color: chartColor(index) }}
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Adherence", value: `${snapshot.adherencePercent}%` },
              { label: "Engagement", value: `${snapshot.engagementScore}` },
              { label: "Open Tasks", value: `${snapshot.openTasks}` }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-3xl font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        <MiniTrendChart title="Blood Pressure" unit="mmHg" points={snapshot.bloodPressureTrend} accent="#6ee7b7" />
        <MiniTrendChart title="Glucose" unit="mg/dL" points={snapshot.glucoseTrend} accent="#38bdf8" />
        <MiniTrendChart title="Adherence" unit="%" points={snapshot.adherenceTrend} accent="#fbbf24" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Medication Snapshot</CardTitle>
            <CardDescription className="text-slate-400">Current regimen and refill risk.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {snapshot.medications.map((medication, index) => (
              <div key={medication.name} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">{medication.name}</div>
                    <div className="text-sm text-slate-400">
                      {medication.dosage} · {medication.frequency}
                    </div>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em]" style={{ borderColor: chartColor(index), color: chartColor(index) }}>
                    {medication.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Care History</CardTitle>
            <CardDescription className="text-slate-400">Latest engagement, interventions, and follow-ups.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {snapshot.timeline.map((item) => (
              <div key={item.id} className={`rounded-2xl border p-4 ${toneClass(item.tone)}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-semibold">{item.title}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.at}</div>
                </div>
                <div className="mt-2 text-sm text-slate-300">{item.detail}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
