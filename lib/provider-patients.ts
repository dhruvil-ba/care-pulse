import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RelatedProfile = {
  userId: string;
  fullName: string | null;
  email: string | null;
};

export type ProviderPatient = {
  patientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  riskLevel: "low" | "medium" | "high";
  dateOfBirth: string;
  createdAt: string;
};

type PatientRow = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  risk_tier: string | null;
  created_at: string;
};

type RelationshipRow = {
  patient_id: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function deriveNameParts(profile: RelatedProfile) {
  const fullName = profile.fullName?.trim();
  if (fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = titleCase(parts[0] ?? "Patient");
    const lastName = titleCase(parts.slice(1).join(" ") || "Patient");
    return { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() };
  }

  const emailLocalPart = profile.email?.split("@")[0] ?? "patient";
  const normalized = emailLocalPart.replace(/[._-]+/g, " ").trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  const firstName = titleCase(parts[0] ?? "Patient");
  const lastName = titleCase(parts.slice(1).join(" ") || "Patient");
  return { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() };
}

async function ensurePatientsForProfiles(profiles: RelatedProfile[]): Promise<PatientRow[]> {
  const supabaseAdmin = getSupabaseAdmin();

  if (profiles.length === 0) {
    return [];
  }

  const userIds = profiles.map((profile) => profile.userId);
  const { data: existingRows, error: existingError } = await supabaseAdmin
    .from("patients")
    .select("id, user_id, first_name, last_name, date_of_birth, risk_tier, created_at")
    .in("user_id", userIds);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const typedExistingRows = (existingRows ?? []) as PatientRow[];
  const existingByUserId = new Map(typedExistingRows.map((row) => [row.user_id, row]));
  const missingProfiles = profiles.filter((profile) => !existingByUserId.has(profile.userId));

  if (missingProfiles.length > 0) {
    for (const profile of missingProfiles) {
      const { data: authUserResult, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(profile.userId);

      if (authUserError || !authUserResult.user) {
        continue;
      }

      const derived = deriveNameParts(profile);
      const { error: insertError } = await supabaseAdmin.from("patients").upsert(
        {
          user_id: profile.userId,
          first_name: derived.firstName,
          last_name: derived.lastName,
          date_of_birth: "1970-01-01",
          gender: "unspecified",
          phone: null,
          risk_tier: "low"
        },
        {
          onConflict: "user_id"
        }
      );

      if (insertError && insertError.code !== "23505") {
        throw new Error(insertError.message);
      }
    }

    const { data: reloadedRows, error: reloadError } = await supabaseAdmin
      .from("patients")
      .select("id, user_id, first_name, last_name, date_of_birth, risk_tier, created_at")
      .in("user_id", userIds);

    if (reloadError) {
      throw new Error(reloadError.message);
    }

    return (reloadedRows ?? []) as PatientRow[];
  }

  return typedExistingRows;
}

export async function listProviderPatients(providerId: string): Promise<ProviderPatient[]> {
  const supabase = createSupabaseServerClient();

  const { data: relationships, error: relationshipError } = await supabase
    .from("care_team_relationships")
    .select("patient_id, profiles:patient_id (full_name)")
    .eq("provider_id", providerId);

  if (relationshipError) {
    throw new Error(relationshipError.message);
  }

  const typedRelationships = (relationships ?? []) as RelationshipRow[];

  const profiles: RelatedProfile[] = typedRelationships.map((relationship) => ({
    userId: relationship.patient_id,
    fullName:
      relationship.profiles && !Array.isArray(relationship.profiles) ? relationship.profiles.full_name : null,
    email: null
  }));

  const patientRows = await ensurePatientsForProfiles(profiles);
  const patientRowByUserId = new Map(patientRows.map((row) => [row.user_id, row]));
  const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));

  return profiles
    .map((profile) => {
      const row = patientRowByUserId.get(profile.userId);
      const derived = deriveNameParts(profile);
      const firstName = row?.first_name ?? derived.firstName;
      const lastName = row?.last_name ?? derived.lastName;

      return {
        patientId: row?.id ?? profile.userId,
        userId: profile.userId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email: profile.email,
        riskLevel: ((row?.risk_tier ?? "low") as "low" | "medium" | "high"),
        dateOfBirth: row?.date_of_birth ?? "1970-01-01",
        createdAt: row?.created_at ?? new Date(0).toISOString()
      } satisfies ProviderPatient;
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
}
