import Link from "next/link";
import { redirect } from "next/navigation";
import { PatientInviteForm } from "@/components/auth/patient-invite-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function InviteSignupPage() {
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

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-16 pt-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-slate-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/40 bg-emerald-300/10 text-emerald-100">
              CP
            </span>
            Care Pulse
          </Link>
          <Link href="/login" className="text-sm text-emerald-200 hover:text-emerald-100">
            Log in
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <PatientInviteForm />
          </div>
        </div>
      </div>
    </main>
  );
}
