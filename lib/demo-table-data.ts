import { appointments, carePlans, medications, patients } from "@/lib/mock-data";

type PatientManagementRow = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Pending";
  riskLevel: "High" | "Medium" | "Low";
  carePlan: string;
  inviteCode?: string | null;
};

export type AppointmentDisplayRow = {
  id: string;
  patientName: string;
  date: string;
  type: string;
  status: "Scheduled" | "Completed" | "Canceled";
};

export type CarePlanDisplayRow = {
  id: string;
  patientName: string;
  conditionName: string;
  status: "Active" | "Completed" | "Draft";
  createdAt: string;
};

export type MedicationDisplayRow = {
  id: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  status: "Active" | "Paused" | "Refill Due";
};

function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

function buildDemoEmail(firstName: string, lastName: string, index: number) {
  return `${firstName}.${lastName}.${index + 1}`.toLowerCase().replace(/\s+/g, "") + "@carepulse.demo";
}

export function buildFallbackPatientDirectoryRows(): PatientManagementRow[] {
  return patients.map((patient, index) => ({
    id: `demo-patient-${patient.id}`,
    name: formatName(patient.first_name, patient.last_name),
    email: buildDemoEmail(patient.first_name, patient.last_name, index),
    status: "Active",
    riskLevel: patient.risk_level === "high" ? "High" : patient.risk_level === "medium" ? "Medium" : "Low",
    carePlan: carePlans[index % carePlans.length]?.condition_name ?? "General"
  }));
}

export function buildDemoAppointments(): AppointmentDisplayRow[] {
  return appointments.map((appointment, index) => {
    const patient = patients.find((entry) => entry.id === appointment.patient_id) ?? patients[index % patients.length];
    return {
      id: appointment.id,
      patientName: formatName(patient.first_name, patient.last_name),
      date: appointment.scheduled_time,
      type:
        appointment.type === "telehealth"
          ? "Telehealth"
          : index % 4 === 0
            ? "Follow-up"
            : "In-Person",
      status:
        appointment.status === "completed"
          ? "Completed"
          : appointment.status === "cancelled"
            ? "Canceled"
            : "Scheduled"
    };
  });
}

export function buildDemoCarePlans(): CarePlanDisplayRow[] {
  return carePlans.map((plan, index) => {
    const patient = patients.find((entry) => entry.id === plan.patient_id) ?? patients[index % patients.length];
    return {
      id: plan.id,
      patientName: formatName(patient.first_name, patient.last_name),
      conditionName: plan.condition_name,
      status:
        plan.status === "completed" ? "Completed" : plan.status === "suspended" ? "Draft" : "Active",
      createdAt: new Date(plan.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
  });
}

export function buildDemoMedications(): MedicationDisplayRow[] {
  return medications.map((medication, index) => {
    const patient = patients.find((entry) => entry.id === medication.patient_id) ?? patients[index % patients.length];
    return {
      id: medication.id,
      patientName: formatName(patient.first_name, patient.last_name),
      medicationName: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      status: medication.is_active ? (index % 6 === 0 ? "Refill Due" : "Active") : "Paused"
    };
  });
}
