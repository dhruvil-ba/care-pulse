"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { buildDemoCarePlans, type CarePlanDisplayRow } from "@/lib/demo-table-data";
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

type CarePlanDraft = CarePlanDisplayRow;

const initialDraft: CarePlanDraft = {
  id: "",
  patientName: "",
  conditionName: "",
  status: "Active",
  createdAt: ""
};

export function CarePlansClient({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rows, setRows] = useState<CarePlanDisplayRow[]>(() => buildDemoCarePlans());
  const [draft, setDraft] = useState<CarePlanDraft>(initialDraft);

  useEffect(() => {
    let mounted = true;
    const loadPatients = async () => {
      const response = await fetch("/api/patients");
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: Patient[] };
      if (mounted && payload.data) setPatients(payload.data);
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

  const resetDraft = () => setDraft(initialDraft);

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRows((current) => [{ ...draft, id: `care-plan-${Date.now()}` }, ...current]);
    setOpen(false);
    resetDraft();
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRows((current) => current.map((row) => (row.id === draft.id ? draft : row)));
    setMode(null);
    resetDraft();
  };

  return (
    <Card>
      <CardHeader className="grid gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-emerald-500/10 px-6 py-5 shadow-[0_25px_60px_-45px_rgba(16,185,129,0.6)] lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" />
            Core Plans
          </span>
          <CardTitle className="text-2xl text-white">Care Plan Management</CardTitle>
          <CardDescription className="text-slate-300">{description}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="h-11 gap-3 rounded-2xl bg-emerald-400/20 px-5 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400/30 hover:text-white lg:justify-self-end">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/25 text-lg font-semibold text-emerald-100">+</span>
              <span className="text-xs font-semibold uppercase tracking-[0.3em]">New Care Plan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Care Plan</DialogTitle>
              <DialogDescription>Create a new care plan record.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
              <label className="space-y-2 text-sm text-slate-300">
                Patient
                <Select required value={draft.patientName} onChange={(event) => setDraft((current) => ({ ...current, patientName: event.target.value }))}>
                  <option value="" disabled>Select patient</option>
                  {patientOptions.map((patient) => (
                    <option key={patient.id} value={patient.label}>{patient.label}</option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Status
                <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as CarePlanDisplayRow["status"] }))}>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </Select>
              </label>
              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                Condition
                <Input required value={draft.conditionName} onChange={(event) => setDraft((current) => ({ ...current, conditionName: event.target.value }))} />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Created
                <Input type="date" required value={draft.createdAt} onChange={(event) => setDraft((current) => ({ ...current, createdAt: event.target.value }))} />
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
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium text-foreground">{plan.patientName}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.conditionName}</TableCell>
                  <TableCell>
                    <Badge variant={plan.status === "Active" ? "success" : plan.status === "Completed" ? "secondary" : "warning"}>{plan.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{plan.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => { setDraft(plan); setMode("edit"); }}><Pencil /></Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => { if (window.confirm("Delete this care plan?")) setRows((current) => current.filter((row) => row.id !== plan.id)); }}><Trash2 /></Button>
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
            <DialogTitle>Edit care plan</DialogTitle>
            <DialogDescription>Update the care plan record.</DialogDescription>
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
              Status
              <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as CarePlanDisplayRow["status"] }))}>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
              </Select>
            </label>
            <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
              Condition
              <Input value={draft.conditionName} onChange={(event) => setDraft((current) => ({ ...current, conditionName: event.target.value }))} />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Created
              <Input type="date" value={draft.createdAt} onChange={(event) => setDraft((current) => ({ ...current, createdAt: event.target.value }))} />
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
