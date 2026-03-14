"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateInviteCode } from "@/lib/invitations";

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function derivePatientName(patientEmail: string, fullName?: string | null) {
  const normalizedFullName = fullName?.trim();

  if (normalizedFullName) {
    const parts = normalizedFullName.split(/\s+/).filter(Boolean);
    const firstName = toTitleCase(parts[0] ?? "Patient");
    const lastName = toTitleCase(parts.slice(1).join(" ") || "Patient");
    return { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() };
  }

  const localPart = patientEmail.split("@")[0] ?? "patient";
  const parts = localPart.replace(/[._-]+/g, " ").split(/\s+/).filter(Boolean);
  const firstName = toTitleCase(parts[0] ?? "Patient");
  const lastName = toTitleCase(parts.slice(1).join(" ") || "Patient");
  return { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() };
}

export async function createInvitation(input: {
  provider_id?: string;
  patient_email: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { patient_email } = input;

  if (!patient_email) {
    return { error: "Patient email is required." } as const;
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const providerId = userData.user?.id;
  const providerName =
    (userData.user?.user_metadata?.full_name as string | undefined | null) ?? null;

  if (!providerId) {
    return { error: "Provider session is required." } as const;
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: providerId,
    role: "provider",
    full_name: providerName?.trim() || "Provider"
  });

  if (profileError) {
    return { error: profileError.message } as const;
  }

  let inviteCode = generateInviteCode();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: existing } = await supabase
      .from("invitations")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (!existing) {
      break;
    }
    inviteCode = generateInviteCode();
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      provider_id: providerId,
      patient_email,
      invite_code: inviteCode
    })
    .select("id, invite_code, status, created_at")
    .single();

  if (error) {
    return { error: error.message } as const;
  }

  return { data } as const;
}

export async function acceptInvitation(input: {
  invite_code: string;
  patient_id: string;
  patient_email: string;
  patient_full_name?: string | null;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { invite_code, patient_id, patient_email, patient_full_name } = input;
  const normalizedCode = invite_code.trim().toUpperCase();

  if (!normalizedCode || !patient_id || !patient_email) {
    return { error: "Invite code, patient id, and email are required." } as const;
  }

  const { data: invitation, error } = await supabaseAdmin
    .from("invitations")
    .select("id, provider_id, patient_email, status")
    .eq("invite_code", normalizedCode)
    .maybeSingle();

  if (error) {
    return { error: error.message } as const;
  }

  if (!invitation) {
    return { error: "Invalid invite code." } as const;
  }

  if (invitation.status !== "pending") {
    return { error: "Invite code already used." } as const;
  }

  if (invitation.patient_email.toLowerCase() !== patient_email.toLowerCase()) {
    return { error: "Invite email does not match." } as const;
  }

  const derivedName = derivePatientName(patient_email, patient_full_name);

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: patient_id,
    role: "patient",
    full_name: derivedName.fullName
  });

  if (profileError) {
    return { error: profileError.message } as const;
  }

  const { error: patientError } = await supabaseAdmin.from("patients").upsert(
    {
      user_id: patient_id,
      first_name: derivedName.firstName,
      last_name: derivedName.lastName,
      date_of_birth: "1970-01-01",
      gender: "unspecified",
      phone: null,
      address: null,
      risk_score: 0,
      risk_tier: "low"
    },
    { onConflict: "user_id" }
  );

  if (patientError) {
    return { error: patientError.message } as const;
  }

  const { error: relationshipError } = await supabaseAdmin
    .from("care_team_relationships")
    .upsert(
      {
        provider_id: invitation.provider_id,
        patient_id
      },
      {
        onConflict: "provider_id,patient_id"
      }
    );

  if (relationshipError) {
    return { error: relationshipError.message } as const;
  }

  const { error: inviteUpdateError } = await supabaseAdmin
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  if (inviteUpdateError) {
    return { error: inviteUpdateError.message } as const;
  }

  return { data: { provider_id: invitation.provider_id } } as const;
}

export async function revokeInvitation(input: { provider_id?: string; invitation_id: string }) {
  const { invitation_id } = input;

  if (!invitation_id) {
    return { error: "Invitation is required." } as const;
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const providerId = userData.user?.id;

  if (!providerId) {
    return { error: "Provider session is required." } as const;
  }

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitation_id)
    .eq("provider_id", providerId);

  if (error) {
    return { error: error.message } as const;
  }

  return { data: { id: invitation_id } } as const;
}

export async function resendInvitation(input: { invitation_id: string }) {
  const { invitation_id } = input;

  if (!invitation_id) {
    return { error: "Invitation is required." } as const;
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const providerId = userData.user?.id;
  const providerName =
    (userData.user?.user_metadata?.full_name as string | undefined | null) ?? null;

  if (!providerId) {
    return { error: "Provider session is required." } as const;
  }

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("id, patient_email, invite_code")
    .eq("id", invitation_id)
    .eq("provider_id", providerId)
    .single();

  if (error || !invitation) {
    return { error: "Invitation not found." } as const;
  }

  if (!invitation.invite_code) {
    return { error: "Invite code unavailable." } as const;
  }

  return {
    data: { id: invitation.id, patient_email: invitation.patient_email, invite_code: invitation.invite_code, providerName }
  } as const;
}
