interface RiskInput {
  systolic?: number | null;
  diastolic?: number | null;
  a1c?: number | null;
  age?: number | null;
  medicationAdherence?: number | null;
}

export function calculateRiskScore(input: RiskInput): number {
  let score = 0;

  if (typeof input.systolic === "number") {
    if (input.systolic >= 160) score += 30;
    else if (input.systolic >= 140) score += 20;
    else if (input.systolic >= 130) score += 10;
  }

  if (typeof input.diastolic === "number") {
    if (input.diastolic >= 100) score += 20;
    else if (input.diastolic >= 90) score += 12;
    else if (input.diastolic >= 80) score += 6;
  }

  if (typeof input.a1c === "number") {
    if (input.a1c >= 9) score += 30;
    else if (input.a1c >= 8) score += 22;
    else if (input.a1c >= 7) score += 12;
  }

  if (typeof input.age === "number") {
    if (input.age >= 75) score += 10;
    else if (input.age >= 60) score += 6;
  }

  if (typeof input.medicationAdherence === "number") {
    if (input.medicationAdherence < 50) score += 15;
    else if (input.medicationAdherence < 70) score += 8;
  }

  return Math.max(0, Math.min(100, score));
}

export function riskTierFromScore(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function ageFromDate(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const yearDiff = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate());
  return beforeBirthday ? yearDiff - 1 : yearDiff;
}
