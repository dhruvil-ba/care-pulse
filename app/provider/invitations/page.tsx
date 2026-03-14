import { redirect } from "next/navigation";
import { NewPatientDialog } from "@/components/provider/new-patient-dialog";
import { PatientsTable, type PatientRow } from "@/components/provider/patients-table";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type InvitationRow = {
  id: string;
  patient_email: string;
  invite_code: string | null;
  created_at: string;
};

export default async function ProviderInvitationsPage() {
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
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invitations</h1>
          <p className="text-sm text-muted-foreground">Track pending invite codes and resend or revoke.</p>
        </div>
        <NewPatientDialog />
      </header>
      <PatientsTable providerId={providerId} rows={rows} viewBasePath="/provider/patients" />
    </main>
  );
}
