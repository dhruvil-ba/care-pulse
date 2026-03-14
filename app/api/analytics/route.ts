import { ehrAdapter } from "@/lib/ehr";
import { getAnalyticsSummary } from "@/lib/in-memory-store";
import { NextResponse } from "next/server";

export async function GET() {
  const summary = getAnalyticsSummary();
  const ehrProbe = await ehrAdapter.fetchPatientSummary("demo-external-1001");

  return NextResponse.json({
    data: {
      ...summary,
      ehrProvider: ehrAdapter.provider,
      ehrConnection: Boolean(ehrProbe)
    }
  });
}
