import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PlatformHeader } from "@/components/platform-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ehrAdapter } from "@/lib/ehr";
import { getAnalyticsSummary } from "@/lib/in-memory-store";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

const kpi = (label: string, value: string | number, trend: string) => (
  <div className="rounded-2xl border border-emerald-400/20 bg-zinc-950/70 p-4 shadow-glass">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
      <span>{label}</span>
      <span className="text-emerald-300">{trend}</span>
    </div>
    <p className="mt-3 text-3xl font-semibold text-emerald-300">{value}</p>
  </div>
);

const patientVitalsTrend = [
  { label: "Oct", adherence: 76, sleep: 6.4, hydration: 58 },
  { label: "Nov", adherence: 79, sleep: 6.8, hydration: 61 },
  { label: "Dec", adherence: 83, sleep: 7.1, hydration: 66 },
  { label: "Jan", adherence: 85, sleep: 7.0, hydration: 69 },
  { label: "Feb", adherence: 89, sleep: 7.3, hydration: 74 },
  { label: "Mar", adherence: 92, sleep: 7.5, hydration: 79 }
];

const patientTasks = [
  {
    title: "Morning glucose log",
    detail: "Submit before 9:00 AM to keep the weekly streak active.",
    status: "Due today"
  },
  {
    title: "Telehealth prep questionnaire",
    detail: "3 quick questions before your Apr 2 visit at 10:30 AM.",
    status: "Upcoming"
  },
  {
    title: "Medication refill confirmation",
    detail: "Metformin refill needs approval in the next 2 days.",
    status: "Attention"
  }
];

const patientTimeline = [
  {
    title: "Blood pressure improved",
    detail: "Average reading dropped by 6 mmHg over the last 14 days.",
    at: "Today, 8:40 AM"
  },
  {
    title: "Coach message delivered",
    detail: "Diet and hydration reminder sent after dinner window.",
    at: "Yesterday, 7:15 PM"
  },
  {
    title: "Care plan milestone reached",
    detail: "You completed 5 consecutive adherence check-ins.",
    at: "Mar 11, 10:05 AM"
  }
];

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  const metadataRole = (userData.user.user_metadata?.role as string | undefined) ?? null;

  const role = profile?.role ?? (metadataRole === "provider" || metadataRole === "patient" ? metadataRole : "patient");
  const summary = role === "provider" ? getAnalyticsSummary() : null;
  const ehrPreview = role === "provider" ? await ehrAdapter.fetchPatientSummary("demo-external-1001") : null;

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="glass-nav hidden h-[calc(100vh-2rem)] rounded-3xl p-4 lg:block">
        <div className="text-lg font-semibold text-white">Care Pulse</div>
        <p className="mt-1 text-sm text-slate-300">Premium chronic care operating layer.</p>
        <Sidebar />
      </aside>
      <section className="relative flex flex-col gap-6">
        <PlatformHeader />
        {role === "provider" ? (
          <main className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Population Analytics</h2>
              <p className="text-sm text-muted-foreground">Aggregate cohort intelligence for your care network.</p>
            </div>
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Population Command Dashboard</CardTitle>
                <CardDescription>
                  Live summary of engagement, adherence, and risk coverage for chronic care cohorts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {summary
                    ? [
                        kpi("Total Patients", summary.totalPatients, "+6% MoM"),
                        kpi("High-Risk Patients", summary.highRiskPatients, "-2%"),
                        kpi("Care Plan Adherence", `${summary.avgCarePlanAdherence}%`, "+3.2%"),
                        kpi("Medication Adherence", `${summary.avgMedicationAdherence}%`, "+1.4%"),
                        kpi("Care Gap Closure", `${summary.careGapClosureRate}%`, "+5%"),
                        kpi("Engagement Rate", `${summary.engagementRate}%`, "+2%")
                      ]
                    : null}
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
                  <div className="flex flex-col gap-4">
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

            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Active Care Programs</CardTitle>
                  <CardDescription>Prioritized by risk and engagement status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {[
                      { name: "90-Day Glycemic Stabilization", owner: "Dr. Rao", status: "On track" },
                      { name: "BP Control Sprint", owner: "Care Team East", status: "At risk" },
                      { name: "COPD Re-engagement", owner: "Respiratory Pod", status: "Improving" }
                    ].map((plan) => (
                      <div
                        key={plan.name}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">{plan.name}</div>
                            <div className="text-xs text-slate-400">Owner: {plan.owner}</div>
                          </div>
                          <span className="text-xs uppercase tracking-[0.2em] text-emerald-200">{plan.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>EHR Integration Status</CardTitle>
                  <CardDescription>Configured adapter for one major EHR provider.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto rounded-2xl border border-white/10">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead className="bg-white/5 text-left text-slate-300">
                        <tr>
                          <th className="px-4 py-3">Provider</th>
                          <th className="px-4 py-3">Connection</th>
                          <th className="px-4 py-3">Last Patient Probe</th>
                          <th className="px-4 py-3">Conditions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-white/10 text-slate-200/90">
                          <td className="px-4 py-3">{ehrAdapter.provider}</td>
                          <td className="px-4 py-3">{ehrPreview ? "Connected (mock)" : "No response"}</td>
                          <td className="px-4 py-3">
                            {ehrPreview ? new Date(ehrPreview.lastEncounterAt).toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-3">{ehrPreview ? ehrPreview.conditions.join(", ") : "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>
        ) : (
          <main className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Personal Dashboard</h2>
              <p className="text-sm text-muted-foreground">A richer view of progress, routines, and upcoming care moments.</p>
            </div>
            <Card className="overflow-hidden">
              <CardHeader className="grid gap-6 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,rgba(2,6,23,0.92),rgba(15,23,42,0.72))] px-6 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-100">
                      Weekly Momentum
                    </span>
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
                      Stable Trend
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white">Your care rhythm is moving in the right direction.</CardTitle>
                    <CardDescription className="mt-2 max-w-2xl text-base text-slate-300">
                      Adherence is up, your next check-in is scheduled, and the care team has fresh monitoring data to review.
                    </CardDescription>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    { label: "Adherence", value: "92%", hint: "Best this quarter" },
                    { label: "Next Visit", value: "Apr 2", hint: "Telehealth · 10:30 AM" },
                    { label: "Response Time", value: "14m", hint: "Avg care-team reply" }
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
                      <div className="mt-2 text-3xl font-semibold text-white">{item.value}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.hint}</div>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: "Medication Adherence", value: "92%", detail: "Up 7% vs last month", accent: "text-emerald-300" },
                { title: "Sleep Consistency", value: "7.5h", detail: "Average over 14 days", accent: "text-cyan-300" },
                { title: "Hydration Score", value: "79", detail: "Daily target almost reached", accent: "text-sky-300" },
                { title: "Care Streak", value: "12 days", detail: "No missed check-ins", accent: "text-amber-300" }
              ].map((card) => (
                <Card key={card.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.detail}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-semibold ${card.accent}`}>{card.value}</div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Analytics</CardTitle>
                  <CardDescription>Monthly momentum across adherence, sleep, and hydration.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <div className="grid grid-cols-6 gap-3">
                      {patientVitalsTrend.map((point) => (
                        <div key={point.label} className="flex flex-col items-center gap-3">
                          <div className="flex h-44 items-end gap-1">
                            <div className="w-3 rounded-full bg-emerald-400/90" style={{ height: `${point.adherence}%` }} />
                            <div className="w-3 rounded-full bg-cyan-400/85" style={{ height: `${point.sleep * 12}%` }} />
                            <div className="w-3 rounded-full bg-amber-400/85" style={{ height: `${point.hydration}%` }} />
                          </div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{point.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Adherence</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Sleep</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Hydration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Checklist</CardTitle>
                  <CardDescription>Most important things to finish before the next visit.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {patientTasks.map((task) => (
                      <div key={task.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">{task.title}</div>
                          <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-200">{task.status}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-400">{task.detail}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Today’s Health Snapshot</CardTitle>
                  <CardDescription>What the care team will likely discuss next.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {[
                      { label: "Blood Pressure", value: "124 / 78", detail: "Within target range" },
                      { label: "Glucose", value: "109 mg/dL", detail: "Morning reading logged" },
                      { label: "Mood Check", value: "Calm", detail: "Self-reported this morning" },
                      { label: "Activity", value: "6,420 steps", detail: "82% of daily goal" }
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
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
                  <CardTitle>Recent Care Activity</CardTitle>
                  <CardDescription>Latest milestones, messages, and monitoring events.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {patientTimeline.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.at}</div>
                        </div>
                        <div className="mt-2 text-sm text-slate-400">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>
        )}
      </section>
    </div>
  );
}
