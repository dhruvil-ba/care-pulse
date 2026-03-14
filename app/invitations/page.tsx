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
    <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="glass-nav hidden h-[calc(100vh-2rem)] rounded-3xl p-4 lg:block">
        <div className="text-lg font-semibold text-white">Care Pulse</div>
        <p className="mt-1 text-sm text-slate-300">Premium chronic care operating layer.</p>
        <Sidebar />
      </aside>
      <section className="relative flex flex-col gap-6">
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
