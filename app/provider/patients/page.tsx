import { redirect } from "next/navigation";
import { NewPatientDialog } from "@/components/provider/new-patient-dialog";
import { PatientsTable } from "@/components/provider/patients-table";
import { getProviderPatientRows } from "@/lib/patient-directory";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ProviderPatientsPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const providerId = userData.user.id;
  const rows = await getProviderPatientRows(providerId);

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Patient Management</h1>
          <p className="text-sm text-muted-foreground">Manage active care relationships and pending invites.</p>
        </div>
        <NewPatientDialog />
      </header>
      <PatientsTable providerId={providerId} rows={rows} viewBasePath="/provider/patients" />
    </main>
  );
}
