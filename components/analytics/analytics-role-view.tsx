"use client";

import { useUserRole } from "@/lib/use-user-role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AnalyticsSummary = {
  totalPatients: number;
  highRiskPatients: number;
  avgCarePlanAdherence: number;
  avgMedicationAdherence: number;
  careGapClosureRate: number;
  engagementRate: number;
};

type AnalyticsRoleViewProps = {
  summary: AnalyticsSummary;
  ehrPreview: string;
};

const kpi = (label: string, value: string | number, trend: string) => (
  <div className="rounded-2xl border border-emerald-400/20 bg-zinc-950/70 p-4 shadow-glass">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
      <span>{label}</span>
      <span className="text-emerald-300">{trend}</span>
    </div>
    <p className="mt-3 text-3xl font-semibold text-emerald-300">{value}</p>
  </div>
);

export function AnalyticsRoleView({ summary, ehrPreview }: AnalyticsRoleViewProps) {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Population Analytics</CardTitle>
          <CardDescription>Loading your dashboard…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (role === "patient") {
    return (
      <>
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Your Health Snapshot</CardTitle>
            <CardDescription>Personal adherence and engagement insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {kpi("Your Care Plan Adherence", `${summary.avgCarePlanAdherence}%`, "+1.2%")}
              {kpi("Medication Adherence", `${summary.avgMedicationAdherence}%`, "+0.8%")}
              {kpi("Engagement Score", `${summary.engagementRate}%`, "+1.5%")}
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Care Timeline</CardTitle>
            <CardDescription>Recent activity pulled from your health record.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {ehrPreview}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Population Command Dashboard</CardTitle>
          <CardDescription>
            Live summary of engagement, adherence, and risk coverage for chronic care cohorts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {kpi("Total Patients", summary.totalPatients, "+6% MoM")}
            {kpi("High-Risk Patients", summary.highRiskPatients, "-2%")}
            {kpi("Care Plan Adherence", `${summary.avgCarePlanAdherence}%`, "+3.2%")}
            {kpi("Medication Adherence", `${summary.avgMedicationAdherence}%`, "+1.4%")}
            {kpi("Care Gap Closure", `${summary.careGapClosureRate}%`, "+5%")}
            {kpi("Engagement Rate", `${summary.engagementRate}%`, "+2%")}
          </section>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operational Pulse</CardTitle>
            <CardDescription>High-level trends across key chronic cohorts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                { label: "Diabetes cohort", value: "1,284", detail: "92% active care plans" },
                { label: "Hypertension cohort", value: "2,091", detail: "88% adherence" },
                { label: "COPD cohort", value: "642", detail: "+12% engagement" }
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{row.label}</div>
                    <div className="text-xs text-slate-400">{row.detail}</div>
                  </div>
                  <div className="text-lg font-semibold text-emerald-200">{row.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Stratification</CardTitle>
            <CardDescription>Current distribution across risk tiers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Low", value: 52, color: "bg-emerald-400" },
                { label: "Medium", value: 31, color: "bg-amber-400" },
                { label: "High", value: 17, color: "bg-rose-400" }
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>{row.label}</span>
                    <span>{row.value}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
