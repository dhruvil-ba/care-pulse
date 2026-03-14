import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PlatformHeader } from "@/components/platform-header";
import { NewPatientDialog } from "@/components/provider/new-patient-dialog";
import { PatientsTable, type PatientRow } from "@/components/provider/patients-table";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type InvitationRow = {
  id: string;
  patient_email: string;
  invite_code: string | null;
  created_at: string;
};

export default async function InvitationsPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const providerId = userData.user.id;

  const { data } = await supabase
    .from("invitations")
    .select("id, patient_email, invite_code, created_at")
    .eq("provider_id", providerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows: PatientRow[] = ((data ?? []) as InvitationRow[]).map((invitation) => ({
    id: invitation.id,
    name: "Invited Patient",
    email: invitation.patient_email,
    status: "Pending",
    riskLevel: "Low",
    carePlan: "General",
    inviteCode: invitation.invite_code
  }));

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-8">
      <aside className="glass-nav hidden overflow-hidden rounded-3xl p-4 lg:fixed lg:left-[max(2rem,calc(50vw-40rem+2rem))] lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:w-[280px] lg:flex-col">
        <div className="text-lg font-semibold text-white">Care Pulse</div>
        <p className="mt-1 text-sm text-slate-300">Premium chronic care operating layer.</p>
        <div className="min-h-0 flex-1">
          <Sidebar />
        </div>
      </aside>
      <section className="relative flex min-w-0 flex-col gap-6 lg:ml-[calc(280px+1.5rem)] lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
        <PlatformHeader />
        <main className="flex flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Invitations</h2>
              <p className="text-sm text-muted-foreground">Track pending invite codes and resend or revoke.</p>
            </div>
            <NewPatientDialog />
          </header>
          <PatientsTable providerId={providerId} rows={rows} viewBasePath="/patients" />
        </main>
      </section>
    </div>
  );
}
