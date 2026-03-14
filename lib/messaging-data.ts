import { listMessages, listPatients } from "@/lib/in-memory-store";
import type { CommunicationLog, Patient } from "@/lib/types";

export const PROVIDER_MESSAGING_USER_ID = "u-prov-001";

export type MessagingContact = {
  userId: string;
  displayName: string;
  riskLevel: Patient["risk_level"];
  email: string;
};

function toPatientUserId(index: number): string {
  return `u-pat-${(index + 1).toString().padStart(3, "0")}`;
}

function toContactEmail(firstName: string, lastName: string): string {
  return `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, "") + "@carepulse.health";
}

export function getProviderMessagingSeed(): {
  providerId: string;
  contacts: MessagingContact[];
  messages: CommunicationLog[];
} {
  const patients = listPatients();
  const contacts: MessagingContact[] = patients.map((patient, index) => ({
    userId: toPatientUserId(index),
    displayName: `${patient.first_name} ${patient.last_name}`,
    riskLevel: patient.risk_level,
    email: toContactEmail(patient.first_name, patient.last_name)
  }));

  const knownUsers = new Set(contacts.map((contact) => contact.userId));
  const messages = listMessages()
    .filter((message) => {
      const isProviderMessage =
        message.sender_id === PROVIDER_MESSAGING_USER_ID || message.receiver_id === PROVIDER_MESSAGING_USER_ID;

      if (!isProviderMessage) {
        return false;
      }

      const otherUser =
        message.sender_id === PROVIDER_MESSAGING_USER_ID ? message.receiver_id : message.sender_id;
      return knownUsers.has(otherUser);
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return {
    providerId: PROVIDER_MESSAGING_USER_ID,
    contacts,
    messages
  };
}
