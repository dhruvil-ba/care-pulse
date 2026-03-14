import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const kpi = (label: string, value: string, trend: string) => (
  <div className="rounded-2xl border border-emerald-400/20 bg-zinc-950/70 p-4 shadow-glass">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
      <span>{label}</span>
      <span className="text-emerald-300">{trend}</span>
    </div>
    <p className="mt-3 text-3xl font-semibold text-emerald-300">{value}</p>
  </div>
);

export default function ProviderAnalyticsPage() {
  return (
    <>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Population Analytics</CardTitle>
          <CardDescription>Macro-level overview of risk, adherence, and engagement.</CardDescription>
        </CardHeader>
        <CardContent>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {kpi("Total Patients", "2,914", "+6% MoM")}
            {kpi("High-Risk Patients", "418", "-2%")}
            {kpi("Care Plan Adherence", "87%", "+3.2%")}
            {kpi("Medication Adherence", "82%", "+1.4%")}
            {kpi("Care Gap Closure", "68%", "+5%")}
            {kpi("Engagement Rate", "74%", "+2%")}
          </section>
        </CardContent>
      </Card>
    </>
  );
}
