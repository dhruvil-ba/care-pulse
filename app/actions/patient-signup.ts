"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { acceptInvitation } from "@/app/actions/invitations";

export async function patientSignup(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const inviteCode = formData.get("inviteCode")?.toString().trim().toUpperCase();

  if (!email || !password || !inviteCode) {
    return { error: "Email, password, and invite code are required." } as const;
  }

  const supabase = createSupabaseServerClient();

  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .select("id, provider_id, patient_email, status")
    .eq("invite_code", inviteCode)
    .eq("status", "pending")
    .maybeSingle();

  if (inviteError) {
    return { error: inviteError.message } as const;
  }

  if (!invitation) {
    return { error: "Invalid or expired invite code." } as const;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    return { error: signUpError.message } as const;
  }

  const patientId = signUpData.user?.id;

  if (!patientId) {
    return { error: "Unable to create patient account." } as const;
  }

  const result = await acceptInvitation({
    invite_code: inviteCode,
    patient_id: patientId,
    patient_email: email
  });

  if (result?.error) {
    return { error: result.error } as const;
  }

  redirect("/analytics");
}
