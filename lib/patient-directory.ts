import "server-only";

import { buildFallbackPatientDirectoryRows } from "@/lib/demo-table-data";
import { listProviderPatients } from "@/lib/provider-patients";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type PatientStatus = "Active" | "Pending";
export type RiskLevel = "High" | "Medium" | "Low";

export type PatientRow = {
  id: string;
  name: string;
  email: string;
  status: PatientStatus;
  riskLevel: RiskLevel;
  carePlan: string;
  inviteCode?: string | null;
};

type InvitationRow = {
  id: string;
  patient_email: string;
  invite_code: string | null;
  created_at: string;
};

export async function getProviderPatientRows(providerId: string): Promise<PatientRow[]> {
  const supabase = createSupabaseServerClient();

  const [activePatientsData, invitationsResult] = await Promise.all([
    listProviderPatients(providerId),
    supabase
      .from("invitations")
      .select("id, patient_email, invite_code, created_at")
      .eq("provider_id", providerId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
  ]);

  const activePatients: PatientRow[] = activePatientsData.map((patient, index) => {
    const resolvedName =
      patient.fullName && patient.fullName.trim() !== "Patient Patient"
        ? patient.fullName
        : `Care Member ${String(index + 1).padStart(2, "0")}`;

    return {
      id: patient.patientId,
      name: resolvedName,
      email: patient.email ?? `member${index + 1}@carepulse.demo`,
      status: "Active" as const,
      riskLevel: (patient.riskLevel === "high" ? "High" : patient.riskLevel === "medium" ? "Medium" : "Low") as RiskLevel,
      carePlan: "General"
    };
  });

  const pendingPatients: PatientRow[] = ((invitationsResult.data ?? []) as InvitationRow[]).map((invitation) => ({
    id: invitation.id,
    name: "Invited Patient",
    email: invitation.patient_email,
    status: "Pending" as const,
    riskLevel: "Low" as const,
    carePlan: "General",
    inviteCode: invitation.invite_code
  }));

  const fallbackRows = buildFallbackPatientDirectoryRows().filter(
    (row) => !activePatients.some((activeRow) => activeRow.email === row.email) && !pendingPatients.some((pendingRow) => pendingRow.email === row.email)
  );

  return [...activePatients, ...pendingPatients, ...fallbackRows];
}
