import Link from "next/link";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

const signalCards = [
  {
    title: "Command Health",
    value: "94%",
    detail: "care plan adherence"
  },
  {
    title: "Response Velocity",
    value: "2.9x",
    detail: "faster outreach loops"
  },
  {
    title: "Risk Coverage",
    value: "38%",
    detail: "gap closures this quarter"
  }
];

const highlightGrid = [
  {
    title: "Unified Care Command",
    description: "Orchestrate pathways, care teams, and outreach in one operational console."
  },
  {
    title: "Predictive Engagement",
    description: "Identify risk shifts early with AI-driven signals and automated nudges."
  },
  {
    title: "Clinical Velocity",
    description: "Automate documentation, scheduling, and follow-ups without losing empathy."
  },
  {
    title: "Outcome Intelligence",
    description: "Visualize performance across cohorts with export-ready reporting."
  }
];

const integrationMarks = ["Epic", "Cerner", "Athena", "Redox", "Twilio", "Surescripts"];

export default function HomePage() {
  return (
    <main
      className={`${display.variable} ${body.variable} relative min-h-screen overflow-hidden bg-[#050608] text-slate-100`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-[-120px] h-[460px] w-[460px] rounded-full bg-emerald-400/25 blur-[140px]" />
        <div className="absolute right-[-200px] top-20 h-[560px] w-[560px] rounded-full bg-cyan-400/20 blur-[160px]" />
        <div className="absolute bottom-[-260px] left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-500/15 blur-[170px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(16,185,129,0.06),_transparent_40%)]" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-10 md:px-10">
        <header className="flex flex-col gap-12">
          <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/40 bg-emerald-300/10 text-emerald-100">
                CP
              </span>
              <div className="font-[family:var(--font-body)] text-base font-semibold tracking-wide">Care Pulse</div>
            </div>
            <div className="hidden items-center gap-6 text-xs uppercase tracking-[0.2em] text-slate-300/80 md:flex">
              <span>Platform</span>
              <span>Security</span>
              <span>Pricing</span>
              <span>Company</span>
              <Link href="/provider/invitations" className="text-emerald-200 hover:text-emerald-100">
                Provider Portal
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full border border-white/10">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/provider/signup">Provider sign up</Link>
              </Button>
            </div>
          </nav>

          <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-emerald-200">
                <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-2">
                  Premium SaaS Platform
                </span>
                <span className="text-slate-400">HIPAA-ready workflows</span>
              </div>
              <h1 className="font-[family:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Orchestrate population health with a premium, AI-accelerated command center.
              </h1>
              <p className="max-w-xl font-[family:var(--font-body)] text-base text-slate-200/80 sm:text-lg">
                Care Pulse gives care organizations a single operational view for every cohort, condition, and care
                pathway. Move faster with orchestrated workflows, predictive risk, and outcome-ready reporting.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/provider/signup">Create provider account</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="rounded-full border border-white/20">
                  <Link href="/invite">Patient invite signup</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-slate-400">
                <span>Realtime cohorts</span>
                <span>AI copilots</span>
                <span>Secure integrations</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -rotate-3 rounded-3xl border border-white/15 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]" />
              <div className="relative rounded-3xl border border-white/15 bg-slate-900/70 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Live Command Feed</div>
                  <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                    Now
                  </div>
                </div>
                <div className="mt-6 grid gap-4">
                  {signalCards.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{item.title}</div>
                        <div className="text-xs text-slate-400">{item.detail}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{item.value}</div>
                        <div className="text-xs text-emerald-300">Live</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                  AI recommendations delivered 3,240 care actions this week.
                </div>
              </div>
            </div>
          </section>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="font-[family:var(--font-display)] text-3xl text-white">Enterprise-grade outcomes</h2>
            <p className="mt-4 text-sm text-slate-300">
              Replace siloed tools with a single operating system for population health. Get full-funnel visibility
              across care teams, patients, and partners.
            </p>
            <div className="mt-8 grid gap-4">
              {signalCards.map((point) => (
                <div key={point.title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="text-2xl font-semibold text-white">{point.value}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{point.title}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {highlightGrid.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                <h3 className="font-[family:var(--font-display)] text-xl text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="font-[family:var(--font-display)] text-3xl text-white">Workflow velocity, redesigned</h2>
            <p className="mt-3 text-sm text-slate-300">
              Move from enrollment to engagement in hours. Care Pulse keeps teams aligned with every next-best
              action.
            </p>
            <div className="mt-8 grid gap-4">
              {[
                {
                  title: "Enroll at scale",
                  detail: "Bulk import rosters, assign pathways, and trigger first-touch outreach automatically."
                },
                {
                  title: "Activate care teams",
                  detail: "Coordinate nurses, care managers, and specialists with real-time task routing."
                },
                {
                  title: "Measure outcomes",
                  detail: "Surface cohort progress and export quality metrics with one-click reporting."
                }
              ].map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 text-sm font-semibold text-emerald-200">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">{step.title}</div>
                    <div className="text-sm text-slate-300">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Integrations</div>
            <div className="mt-6 grid gap-4">
              {integrationMarks.map((name) => (
                <div
                  key={name}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  {name}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.2em] text-slate-400">
              Secure, audited, and SOC-2 ready.
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-emerald-300/10 to-transparent p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-[family:var(--font-display)] text-3xl text-white">
                Launch your next care program in days.
              </h2>
              <p className="mt-3 text-sm text-slate-200/80">
                Bring your care teams, patients, and partners into one operational view. Care Pulse integrates with
                your existing stack and scales from pilots to national rollouts.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-white/90">
              <Link href="/provider/signup">Get started</Link>
            </Button>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-white/10 pt-8 text-xs uppercase tracking-[0.2em] text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>Care Pulse Health Systems</span>
          <div className="flex gap-6">
            <span>Security</span>
            <span>Compliance</span>
            <span>Contact</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
