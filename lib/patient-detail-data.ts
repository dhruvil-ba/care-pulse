import "server-only";

import type { PatientRow } from "@/lib/patient-directory";

type TrendPoint = {
  label: string;
  value: number;
};

type TimelineItem = {
  id: string;
  title: string;
  detail: string;
  at: string;
  tone: "stable" | "warning" | "improving";
};

export type PatientDetailSnapshot = {
  id: string;
  name: string;
  email: string;
  riskLevel: PatientRow["riskLevel"];
  carePlan: string;
  status: PatientRow["status"];
  age: number;
  lastCheckIn: string;
  adherencePercent: number;
  engagementScore: number;
  openTasks: number;
  conditions: string[];
  medications: Array<{ name: string; dosage: string; frequency: string; status: string }>;
  bloodPressureTrend: TrendPoint[];
  glucoseTrend: TrendPoint[];
  adherenceTrend: TrendPoint[];
  timeline: TimelineItem[];
};

const monthLabels = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function createSeed(value: string) {
  return Array.from(value).reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);
}

function makeTrend(seed: number, start: number, variance: number): TrendPoint[] {
  return monthLabels.map((label, index) => ({
    label,
    value: Math.max(0, Math.round(start + Math.sin((seed + index) / 4) * variance + ((seed + index * 17) % 9)))
  }));
}

function formatRelativeDate(seed: number, offset: number) {
  const date = new Date(Date.UTC(2026, 2, Math.max(1, 14 - offset - (seed % 4)), 9 + (seed % 7), (seed * 13) % 60));
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function buildPatientDetailSnapshot(row: PatientRow): PatientDetailSnapshot {
  const seed = createSeed(row.id + row.email + row.name);
  const conditions =
    row.carePlan === "General"
      ? row.riskLevel === "High"
        ? ["Type 2 Diabetes", "Hypertension"]
        : row.riskLevel === "Medium"
          ? ["Hypertension", "Weight Management"]
          : ["Preventive Monitoring", "Lifestyle Coaching"]
      : [row.carePlan, row.riskLevel === "High" ? "Cardio Monitoring" : "Adherence Review"];

  const adherencePercent = 68 + (seed % 24);
  const engagementScore = 62 + (seed % 31);
  const openTasks = 1 + (seed % 4);
  const age = 34 + (seed % 39);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    riskLevel: row.riskLevel,
    carePlan: row.carePlan,
    status: row.status,
    age,
    lastCheckIn: formatRelativeDate(seed, 1),
    adherencePercent,
    engagementScore,
    openTasks,
    conditions,
    medications: [
      {
        name: seed % 2 === 0 ? "Metformin" : "Lisinopril",
        dosage: seed % 2 === 0 ? "500 mg" : "20 mg",
        frequency: "Twice daily",
        status: "Active"
      },
      {
        name: seed % 3 === 0 ? "Atorvastatin" : "Vitamin D3",
        dosage: seed % 3 === 0 ? "10 mg" : "1000 IU",
        frequency: "Nightly",
        status: seed % 5 === 0 ? "Refill Due" : "Active"
      }
    ],
    bloodPressureTrend: makeTrend(seed, row.riskLevel === "High" ? 146 : row.riskLevel === "Medium" ? 134 : 122, 8),
    glucoseTrend: makeTrend(seed + 9, row.riskLevel === "High" ? 188 : row.riskLevel === "Medium" ? 142 : 104, 10),
    adherenceTrend: makeTrend(seed + 21, adherencePercent - 8, 6),
    timeline: [
      {
        id: `${row.id}-1`,
        title: "Remote check-in completed",
        detail: "Patient submitted this week's monitoring entries and symptom survey.",
        at: formatRelativeDate(seed, 0),
        tone: "improving"
      },
      {
        id: `${row.id}-2`,
        title: "Medication review flagged",
        detail: "Dose timing needs confirmation before next refill cycle.",
        at: formatRelativeDate(seed, 3),
        tone: "warning"
      },
      {
        id: `${row.id}-3`,
        title: "Care plan milestone updated",
        detail: "Provider adjusted intervention targets after trend review.",
        at: formatRelativeDate(seed, 6),
        tone: "stable"
      },
      {
        id: `${row.id}-4`,
        title: "Outbound coaching message sent",
        detail: "Lifestyle coaching sequence delivered through secure messaging.",
        at: formatRelativeDate(seed, 9),
        tone: "stable"
      }
    ]
  };
}
