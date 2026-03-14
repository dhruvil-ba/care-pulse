import { notFound, redirect } from "next/navigation";
import { PatientDetailView } from "@/components/provider/patient-detail-view";
import { buildPatientDetailSnapshot } from "@/lib/patient-detail-data";
import { getProviderPatientRows } from "@/lib/patient-directory";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const rows = await getProviderPatientRows(userData.user.id);
  const row = rows.find((entry) => entry.id === params.id && entry.status === "Active");

  if (!row) {
    notFound();
  }

  const snapshot = buildPatientDetailSnapshot(row);

  return <PatientDetailView snapshot={snapshot} backHref="/patients" />;
}
