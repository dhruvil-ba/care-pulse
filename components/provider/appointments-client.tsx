"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { buildDemoAppointments, type AppointmentDisplayRow } from "@/lib/demo-table-data";
import type { Patient } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AppointmentDraft = AppointmentDisplayRow;

const initialDraft: AppointmentDraft = {
  id: "",
  patientName: "",
  date: "",
  type: "Telehealth",
  status: "Scheduled"
};

export function AppointmentsClient({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rows, setRows] = useState<AppointmentDisplayRow[]>(() => buildDemoAppointments());
  const [draft, setDraft] = useState<AppointmentDraft>(initialDraft);

  useEffect(() => {
    let mounted = true;

    const loadPatients = async () => {
      const response = await fetch("/api/patients");
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: Patient[] };
      if (mounted && payload.data) {
        setPatients(payload.data);
      }
    };

    loadPatients();

    return () => {
      mounted = false;
    };
  }, []);

  const patientOptions = patients.map((patient) => ({
    id: patient.id,
    label: `${patient.first_name} ${patient.last_name}`
  }));

  const statusVariant = (status: AppointmentDisplayRow["status"]) => {
    if (status === "Completed") return "success";
    if (status === "Canceled") return "danger";
    return "warning";
  };

  const resetDraft = () => setDraft(initialDraft);

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRows((current) => [{ ...draft, id: `appointment-${Date.now()}` }, ...current]);
    setOpen(false);
    resetDraft();
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRows((current) => current.map((row) => (row.id === draft.id ? draft : row)));
    setMode(null);
    resetDraft();
  };

  const openEdit = (row: AppointmentDisplayRow) => {
    setDraft(row);
    setMode("edit");
  };

  const removeRow = (id: string) => {
    if (!window.confirm("Delete this appointment?")) return;
    setRows((current) => current.filter((row) => row.id !== id));
  };

  return (
    <Card>
      <CardHeader className="grid gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-emerald-500/10 px-6 py-5 shadow-[0_25px_60px_-45px_rgba(16,185,129,0.6)] lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" />
            Appointments
          </span>
          <CardTitle className="text-2xl text-white">Appointments</CardTitle>
          <CardDescription className="text-slate-300">{description}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="h-11 gap-3 rounded-2xl bg-emerald-400/20 px-5 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400/30 hover:text-white lg:justify-self-end">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/25 text-lg font-semibold text-emerald-100">+</span>
              <span className="text-xs font-semibold uppercase tracking-[0.3em]">New Appointment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
              <DialogDescription>Create a new appointment entry.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
              <label className="space-y-2 text-sm text-slate-300">
                Patient
                <Select
                  required
                  value={draft.patientName}
                  onChange={(event) => setDraft((current) => ({ ...current, patientName: event.target.value }))}
                >
                  <option value="" disabled>Select patient</option>
                  {patientOptions.map((patient) => (
                    <option key={patient.id} value={patient.label}>{patient.label}</option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Type
                <Select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}>
                  <option value="Telehealth">Telehealth</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Follow-up">Follow-up</option>
                </Select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Status
                <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as AppointmentDisplayRow["status"] }))}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Canceled">Canceled</option>
                </Select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Date
                <Input type="datetime-local" required value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
              </label>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-2xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium text-foreground">{appointment.patientName}</TableCell>
                  <TableCell className="text-muted-foreground">{appointment.type}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(appointment.status)}>{appointment.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(appointment.date).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(appointment)}><Pencil /></Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow(appointment.id)}><Trash2 /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={mode !== null} onOpenChange={(nextOpen) => !nextOpen && setMode(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit appointment</DialogTitle>
            <DialogDescription>Update appointment fields.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
            <label className="space-y-2 text-sm text-slate-300">
              Patient
              <Select value={draft.patientName} onChange={(event) => setDraft((current) => ({ ...current, patientName: event.target.value }))}>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.label}>{patient.label}</option>
                ))}
              </Select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Type
              <Select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}>
                <option value="Telehealth">Telehealth</option>
                <option value="In-Person">In-Person</option>
                <option value="Follow-up">Follow-up</option>
              </Select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Status
              <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as AppointmentDisplayRow["status"] }))}>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </Select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Date
              <Input type="datetime-local" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
