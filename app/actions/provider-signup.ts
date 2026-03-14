"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function createProviderProfile(input: {
  user_id: string;
  email: string;
  full_name?: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { user_id, email, full_name } = input;

  if (!user_id || !email) {
    return { error: "User id and email are required." } as const;
  }

  const { error } = await supabaseAdmin.from("profiles").upsert({
    id: user_id,
    role: "provider",
    email,
    full_name: full_name || null
  });

  if (error) {
    return { error: error.message } as const;
  }

  return { data: { id: user_id } } as const;
}
