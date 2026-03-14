import { analyticsSummary, appointments, carePlans, medications, messages, patients } from "@/lib/mock-data";
import { Appointment, CarePlan, CommunicationLog, Medication, Patient } from "@/lib/types";

const state = {
  patients: [...patients],
  carePlans: [...carePlans],
  medications: [...medications],
  appointments: [...appointments],
  messages: [...messages]
};

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listPatients(): Patient[] {
  return [...state.patients].sort((a, b) => a.last_name.localeCompare(b.last_name));
}

export function createPatient(input: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number?: string;
  risk_level?: Patient["risk_level"];
}): Patient {
  const now = new Date().toISOString();
  const patient: Patient = {
    id: makeId("p"),
    first_name: input.first_name,
    last_name: input.last_name,
    date_of_birth: input.date_of_birth,
    contact_number: input.contact_number ?? null,
    risk_level: input.risk_level ?? "low",
    created_at: now,
    updated_at: now
  };

  state.patients.push(patient);
  return patient;
}

export function listCarePlans(): CarePlan[] {
  return [...state.carePlans].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createCarePlan(input: {
  patient_id: string;
  provider_id: string;
  condition_name: string;
  status: CarePlan["status"];
}): CarePlan {
  const plan: CarePlan = {
    id: makeId("cp"),
    patient_id: input.patient_id,
    provider_id: input.provider_id,
    condition_name: input.condition_name,
    status: input.status,
    created_at: new Date().toISOString()
  };

  state.carePlans.push(plan);
  return plan;
}

export function listMedications(): Medication[] {
  return [...state.medications].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createMedication(input: {
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  is_active?: boolean;
}): Medication {
  const medication: Medication = {
    id: makeId("m"),
    patient_id: input.patient_id,
    name: input.name,
    dosage: input.dosage,
    frequency: input.frequency,
    is_active: input.is_active ?? true,
    created_at: new Date().toISOString()
  };

  state.medications.push(medication);
  return medication;
}

export function listAppointments(): Appointment[] {
  return [...state.appointments].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
}

export function createAppointment(input: {
  patient_id: string;
  provider_id: string;
  scheduled_time: string;
  status: Appointment["status"];
  type: Appointment["type"];
}): Appointment {
  const appointment: Appointment = {
    id: makeId("a"),
    patient_id: input.patient_id,
    provider_id: input.provider_id,
    scheduled_time: input.scheduled_time,
    status: input.status,
    type: input.type,
    created_at: new Date().toISOString()
  };

  state.appointments.push(appointment);
  return appointment;
}

export function listMessages(): CommunicationLog[] {
  return [...state.messages].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createMessage(input: {
  sender_id: string;
  receiver_id: string;
  message_content: string;
  is_read?: boolean;
}): CommunicationLog {
  const message: CommunicationLog = {
    id: makeId("msg"),
    sender_id: input.sender_id,
    receiver_id: input.receiver_id,
    message_content: input.message_content,
    is_read: input.is_read ?? false,
    created_at: new Date().toISOString()
  };

  state.messages.push(message);
  return message;
}

export function getAnalyticsSummary() {
  const highRiskPatients = state.patients.filter((p) => p.risk_level === "high").length;

  return {
    totalPatients: state.patients.length,
    highRiskPatients,
    avgCarePlanAdherence: analyticsSummary.avgCarePlanAdherence,
    avgMedicationAdherence: analyticsSummary.avgMedicationAdherence,
    careGapClosureRate: analyticsSummary.careGapClosureRate,
    engagementRate: analyticsSummary.engagementRate
  };
}
