export interface EHRPatientRecord {
  externalId: string;
  fullName: string;
  dob: string;
  conditions: string[];
  lastEncounterAt: string;
}

export interface EHRAdapter {
  provider: string;
  fetchPatientSummary(externalPatientId: string): Promise<EHRPatientRecord | null>;
  pushCarePlanUpdate(input: {
    externalPatientId: string;
    carePlanTitle: string;
    notes: string;
  }): Promise<{ status: "ok" | "error"; detail: string }>;
}

class MockEpicAdapter implements EHRAdapter {
  provider = "Epic Sandbox (Mock)";

  async fetchPatientSummary(externalPatientId: string): Promise<EHRPatientRecord | null> {
    if (!externalPatientId) return null;
    return {
      externalId: externalPatientId,
      fullName: "Demo Patient",
      dob: "1975-04-21",
      conditions: ["Diabetes", "Hypertension"],
      lastEncounterAt: new Date().toISOString()
    };
  }

  async pushCarePlanUpdate(input: {
    externalPatientId: string;
    carePlanTitle: string;
    notes: string;
  }): Promise<{ status: "ok" | "error"; detail: string }> {
    if (!input.externalPatientId || !input.carePlanTitle) {
      return { status: "error", detail: "Missing external patient or care plan title." };
    }
    return { status: "ok", detail: "Care plan update queued to Epic sandbox feed." };
  }
}

export const ehrAdapter: EHRAdapter = new MockEpicAdapter();
