export type UserRole = "patient" | "provider" | "admin";

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number: string | null;
  risk_level: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface CareProvider {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  npi_number: string | null;
  created_at: string;
}

export interface CarePlan {
  id: string;
  patient_id: string;
  provider_id: string;
  condition_name: string;
  status: "active" | "completed" | "suspended";
  created_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  scheduled_time: string;
  status: "scheduled" | "completed" | "cancelled";
  type: "in_person" | "telehealth";
  created_at: string;
}

export interface CommunicationLog {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_content: string;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  totalPatients: number;
  highRiskPatients: number;
  avgCarePlanAdherence: number;
  avgMedicationAdherence: number;
  careGapClosureRate: number;
  engagementRate: number;
}
