"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateInviteCode } from "@/lib/invitations";

export async function invitePatient(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email) {
    return { error: "Email is required." } as const;
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return { error: "Provider session is required." } as const;
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "provider") {
    return { error: "Only providers can invite patients." } as const;
  }

  const inviteCode = generateInviteCode(6);

  const { error } = await supabase.from("invitations").insert({
    provider_id: user.id,
    patient_email: email,
    invite_code: inviteCode
  });

  if (error) {
    return { error: error.message } as const;
  }

  revalidatePath("/patients");
  return { inviteCode } as const;
}
