import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  patient_id: z.string().min(1),
  provider_id: z.string().optional(),
  condition_name: z.string().min(1),
  status: z.enum(["active", "completed", "suspended"]).optional()
});

const normalizeConditionCode = (conditionName: string) => {
  const normalized = conditionName.trim().toLowerCase();
  if (normalized.includes("hyper")) return "hypertension";
  if (normalized.includes("copd")) return "copd";
  return "diabetes";
};

const normalizeStatus = (status?: string) => {
  if (status === "completed") return "completed";
  if (status === "suspended") return "paused";
  return "active";
};

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("care_plans").select("*").order("created_at", { ascending: false });

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

  const conditionCode = normalizeConditionCode(parsed.data.condition_name);
  const status = normalizeStatus(parsed.data.status);

  const { data: created, error: insertError } = await supabase
    .from("care_plans")
    .insert({
      patient_id: parsed.data.patient_id,
      provider_id: provider.id,
      condition_code: conditionCode,
      title: `${parsed.data.condition_name} Care Plan`,
      goals: "Improve outcomes and adherence through coordinated care.",
      interventions: "Remote monitoring, education, and scheduled follow-ups.",
      target_metric: "Adherence",
      target_value: null,
      starts_on: new Date().toISOString().slice(0, 10),
      ends_on: null,
      status
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data: created }, { status: 201 });
}
