import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    redirect("/analytics");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050608] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-140px] h-[420px] w-[420px] rounded-full bg-emerald-400/20 blur-[140px]" />
        <div className="absolute right-[-200px] top-12 h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-[160px]" />
        <div className="absolute bottom-[-200px] left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-[170px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.09),_transparent_36%),linear-gradient(90deg,rgba(15,23,42,0.18),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-slate-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/40 bg-emerald-300/10 text-emerald-100">
              CP
            </span>
            Care Pulse
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-14 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.26em] text-emerald-100">
                Secure Care Workspace
              </span>
              <div className="space-y-4">
                <h1 className="max-w-xl text-5xl font-semibold leading-tight text-white">
                  Log in to your chronic care command center.
                </h1>
                <p className="max-w-2xl text-lg text-slate-300">
                  Review care plans, appointments, medication workflows, patient progress, and outreach from one
                  focused operating layer.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Care plans", value: "148", detail: "active workflows" },
                { label: "Messages", value: "24", detail: "awaiting review" },
                { label: "Adherence", value: "92%", detail: "current program avg" }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-emerald-200">{item.value}</div>
                  <div className="mt-2 text-sm text-slate-400">{item.detail}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_80px_-52px_rgba(16,185,129,0.55)] backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">What you can do</div>
                  <div className="mt-3 text-2xl font-semibold text-white">Stay on top of every critical care moment.</div>
                </div>
                <div className="grid gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Track patient engagement, adherence, and upcoming visits in one place.</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Coordinate medication updates and care-plan changes without leaving the dashboard.</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Review outreach history and respond quickly to new patient events.</div>
                </div>
              </div>
            </div>
          </section>

          <div className="w-full max-w-md justify-self-center lg:justify-self-end">
            <AuthForm mode="login" />
          </div>
        </div>
      </div>
    </main>
  );
}
