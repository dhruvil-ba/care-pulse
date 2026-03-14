import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  patient_id: z.string().min(1),
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  is_active: z.boolean().optional()
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("medications").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: provider, error: providerError } = await supabase
    .from("care_providers")
    .select("id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (providerError) {
    return NextResponse.json({ error: providerError.message }, { status: 500 });
  }

  if (!provider) {
    return NextResponse.json({ error: "Provider profile not found." }, { status: 403 });
  }

  const { data: created, error: insertError } = await supabase
    .from("medications")
    .insert({
      patient_id: parsed.data.patient_id,
      prescribed_by: provider.id,
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      frequency: parsed.data.frequency,
      is_active: parsed.data.is_active ?? true
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data: created }, { status: 201 });
}
