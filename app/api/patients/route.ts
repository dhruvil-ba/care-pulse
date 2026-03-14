import { createSupabaseServerClient } from "@/lib/supabase-server";
import { listProviderPatients } from "@/lib/provider-patients";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string().min(8),
  gender: z.string().min(1),
  contact_number: z.string().optional(),
  risk_level: z.enum(["low", "medium", "high"]).optional()
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (profile?.role === "provider") {
    try {
      const providerPatients = await listProviderPatients(userData.user.id);
      return NextResponse.json({
        data: providerPatients.map((patient) => ({
          id: patient.patientId,
          first_name: patient.firstName,
          last_name: patient.lastName,
          date_of_birth: patient.dateOfBirth,
          contact_number: null,
          risk_level: patient.riskLevel,
          created_at: patient.createdAt,
          updated_at: patient.createdAt
        }))
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load patients.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, date_of_birth, phone, risk_tier, created_at")
    .order("last_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mapped = (data ?? []).map((patient) => ({
    id: patient.id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    date_of_birth: patient.date_of_birth,
    contact_number: patient.phone ?? null,
    risk_level: patient.risk_tier ?? "low",
    created_at: patient.created_at,
    updated_at: patient.created_at
  }));

  return NextResponse.json({ data: mapped });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: created, error } = await supabase
    .from("patients")
    .insert({
      user_id: parsed.data.user_id,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      date_of_birth: parsed.data.date_of_birth,
      gender: parsed.data.gender,
      phone: parsed.data.contact_number ?? null,
      risk_tier: parsed.data.risk_level ?? "low"
    })
    .select("id, first_name, last_name, date_of_birth, phone, risk_tier, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: {
        id: created.id,
        first_name: created.first_name,
        last_name: created.last_name,
        date_of_birth: created.date_of_birth,
        contact_number: created.phone ?? null,
        risk_level: created.risk_tier ?? "low",
        created_at: created.created_at,
        updated_at: created.created_at
      }
    },
    { status: 201 }
  );
}
