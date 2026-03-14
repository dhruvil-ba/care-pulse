import { AnalyticsSummary, Appointment, CarePlan, CommunicationLog, Medication, Patient } from "@/lib/types";

const mockFirstNames = [
  "Maya",
  "Aaron",
  "Lena",
  "Jordan",
  "Priya",
  "Caleb",
  "Nina",
  "Marcus",
  "Elena",
  "Noah",
  "Ivy",
  "Miles",
  "Sofia",
  "Daniel",
  "Avery",
  "Ethan",
  "Layla",
  "Theo",
  "Ruby",
  "Isaac",
  "Chloe",
  "Owen",
  "Aisha",
  "Hudson",
  "Mila",
  "Julian",
  "Zara",
  "Micah",
  "Leah",
  "Ezra",
  "Riley",
  "Nathan",
  "Aria",
  "Silas",
  "Camila",
  "Roman",
  "Eva",
  "Jonah",
  "Naomi",
  "Luca",
  "Harper",
  "Kai",
  "Isla",
  "Asher",
  "Mia",
  "Xavier",
  "Nora",
  "Declan",
  "Aurora",
  "Leo"
];

const mockLastNames = [
  "Bennett",
  "Mills",
  "Torres",
  "Hayes",
  "Patel",
  "Foster",
  "Kim",
  "Coleman",
  "Vargas",
  "Brooks",
  "Nguyen",
  "Sullivan",
  "Reed",
  "Ramirez",
  "Price",
  "Baker",
  "Diaz",
  "Turner",
  "Parker",
  "Rivera",
  "Morris",
  "Ward",
  "Shah",
  "Griffin",
  "Sanders",
  "Ross",
  "Flores",
  "Bell",
  "Cook",
  "Murphy",
  "Bailey",
  "Powell",
  "Long",
  "Barnes",
  "Wood",
  "Cooper",
  "Peterson",
  "Gray",
  "James",
  "Watson",
  "Bryant",
  "Russell",
  "Hamilton",
  "Henderson",
  "Cole",
  "Jenkins",
  "Perry",
  "Butler",
  "Fisher",
  "Ward"
];

const mockRiskLevels: Patient["risk_level"][] = ["high", "medium", "low", "medium", "low"];

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function buildMockPatients(total: number): Patient[] {
  return Array.from({ length: total }, (_, index) => {
    const patientNumber = index + 1;
    const month = (index % 12) + 1;
    const day = (index % 27) + 1;
    const birthYear = 1958 + (index % 42);
    const createdDay = (index % 28) + 1;
    const createdHour = 8 + (index % 10);
    const riskLevel = mockRiskLevels[index % mockRiskLevels.length];

    return {
      id: `p-${patientNumber.toString().padStart(3, "0")}`,
      first_name: mockFirstNames[index % mockFirstNames.length],
      last_name: mockLastNames[index % mockLastNames.length],
      date_of_birth: `${birthYear}-${pad(month)}-${pad(day)}`,
      contact_number: `+1-415-555-${(1200 + patientNumber).toString().padStart(4, "0")}`,
      risk_level: riskLevel,
      created_at: `2026-02-${pad(createdDay)}T${pad(createdHour)}:${pad((index * 7) % 60)}:00Z`,
      updated_at: `2026-03-${pad(createdDay)}T${pad(createdHour)}:${pad((index * 11) % 60)}:00Z`
    };
  });
}

export const patients: Patient[] = buildMockPatients(50);

const mockConditions = [
  "Type 2 Diabetes",
  "Hypertension",
  "COPD",
  "Heart Failure",
  "Chronic Kidney Disease",
  "Asthma"
];

const mockCarePlanStatuses: CarePlan["status"][] = ["active", "completed", "suspended", "active", "active"];

const mockMedicationNames = [
  "Metformin",
  "Lisinopril",
  "Atorvastatin",
  "Amlodipine",
  "Albuterol",
  "Losartan",
  "Jardiance",
  "Hydrochlorothiazide"
];

const mockDosages = ["5 mg", "10 mg", "20 mg", "25 mg", "500 mg", "50 units"];
const mockFrequencies = ["Once daily", "Twice daily", "With breakfast", "At bedtime", "Every 12 hours"];
const mockAppointmentStatuses: Appointment["status"][] = ["scheduled", "completed", "cancelled", "scheduled"];
const mockAppointmentTypes: Appointment["type"][] = ["telehealth", "in_person", "telehealth"];
const mockMessageTemplates = [
  "Please upload this week's fasting glucose readings before Friday.",
  "Reminder: your care plan review is due tomorrow.",
  "Your blood pressure trend improved this week. Keep logging daily values.",
  "Please confirm whether you need a refill before the weekend.",
  "I noticed a missed reading. Can you update the portal today?",
  "Let's review medication timing during the next check-in."
];

function buildMockCarePlans(total: number): CarePlan[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `cp-${(index + 1).toString().padStart(3, "0")}`,
    patient_id: patients[index % patients.length].id,
    provider_id: "pr-001",
    condition_name: mockConditions[index % mockConditions.length],
    status: mockCarePlanStatuses[index % mockCarePlanStatuses.length],
    created_at: `2026-02-${pad((index % 28) + 1)}T${pad(9 + (index % 8))}:${pad((index * 9) % 60)}:00Z`
  }));
}

function buildMockMedications(total: number): Medication[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `m-${(index + 1).toString().padStart(3, "0")}`,
    patient_id: patients[index % patients.length].id,
    name: mockMedicationNames[index % mockMedicationNames.length],
    dosage: mockDosages[index % mockDosages.length],
    frequency: mockFrequencies[index % mockFrequencies.length],
    is_active: index % 5 !== 0,
    created_at: `2026-02-${pad((index % 28) + 1)}T${pad(7 + (index % 10))}:${pad((index * 13) % 60)}:00Z`
  }));
}

function buildMockAppointments(total: number): Appointment[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `a-${(index + 1).toString().padStart(3, "0")}`,
    patient_id: patients[index % patients.length].id,
    provider_id: "pr-001",
    scheduled_time: `2026-03-${pad((index % 28) + 1)}T${pad(9 + (index % 8))}:${pad((index * 5) % 60)}:00Z`,
    type: mockAppointmentTypes[index % mockAppointmentTypes.length],
    status: mockAppointmentStatuses[index % mockAppointmentStatuses.length],
    created_at: `2026-02-${pad((index % 28) + 1)}T${pad(8 + (index % 8))}:${pad((index * 3) % 60)}:00Z`
  }));
}

function buildMockMessages(total: number): CommunicationLog[] {
  return Array.from({ length: total }, (_, index) => {
    const patientNumber = (index % patients.length) + 1;
    const patientUserId = `u-pat-${patientNumber.toString().padStart(3, "0")}`;
    const providerStarts = index % 2 === 0;

    return {
      id: `msg-${(index + 1).toString().padStart(3, "0")}`,
      sender_id: providerStarts ? "u-prov-001" : patientUserId,
      receiver_id: providerStarts ? patientUserId : "u-prov-001",
      message_content: mockMessageTemplates[index % mockMessageTemplates.length],
      is_read: index % 3 !== 0,
      created_at: `2026-03-${pad((index % 28) + 1)}T${pad(8 + (index % 11))}:${pad((index * 17) % 60)}:00Z`
    };
  });
}

export const carePlans: CarePlan[] = buildMockCarePlans(50);

export const medications: Medication[] = buildMockMedications(50);

export const appointments: Appointment[] = buildMockAppointments(50);

export const messages: CommunicationLog[] = buildMockMessages(50);

export const analyticsSummary: AnalyticsSummary = {
  totalPatients: patients.length,
  highRiskPatients: patients.filter((p) => p.risk_level === "high").length,
  avgCarePlanAdherence: 78,
  avgMedicationAdherence: 85,
  careGapClosureRate: 67,
  engagementRate: 74
};
