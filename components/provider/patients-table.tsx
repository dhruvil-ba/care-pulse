"use client";

import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { resendInvitation, revokeInvitation } from "@/app/actions/invitations";
import { sendInviteEmail } from "@/lib/emailjs-client";
import type { PatientRow } from "@/lib/patient-directory";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toaster";
import { Eye, MoreVertical } from "lucide-react";

export type { PatientRow } from "@/lib/patient-directory";

type PatientsTableProps = {
  providerId: string;
  rows: PatientRow[];
  viewBasePath: Route;
};

type BadgeVariant = NonNullable<BadgeProps["variant"]>;
const PAGE_SIZE = 25;

const statusVariant: Record<PatientRow["status"], BadgeVariant> = {
  Active: "success",
  Pending: "warning"
};

const riskVariant: Record<PatientRow["riskLevel"], BadgeVariant> = {
  High: "danger",
  Medium: "warning",
  Low: "muted"
};

export function PatientsTable({ providerId, rows, viewBasePath }: PatientsTableProps) {
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageStart = rows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, rows.length);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      setOpenRowId(null);
    });
  };

  const handleCopyInvite = async (inviteCode?: string | null) => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      // Ignore clipboard errors for now.
    }
  };

  const handleRevokeInvite = (invitationId: string) => {
    startTransition(async () => {
      setRevokingId(invitationId);
      const result = await revokeInvitation({ provider_id: providerId, invitation_id: invitationId });
      setRevokingId(null);
      if (!result?.error) {
        router.refresh();
      }
    });
  };

  const handleResendInvite = (invitationId: string) => {
    startTransition(async () => {
      setResendingId(invitationId);
      const result = await resendInvitation({ invitation_id: invitationId });
      setResendingId(null);
      if (result?.error) {
        toast.error("Resend failed", result.error);
        return;
      }
          if (result.data?.invite_code && result.data.patient_email) {
            try {
              const acceptUrl = `${window.location.origin}/invite?code=${result.data.invite_code}`;
              await sendInviteEmail({
                to: result.data.patient_email,
                inviteCode: result.data.invite_code,
                providerName: result.data.providerName,
                title: "Care Pulse invite code",
                message: `${result.data.providerName ?? "Your Care Pulse provider"} is resending the code (${result.data.invite_code}) so you can complete signup; accept it at ${acceptUrl}.`
              });
          toast.success("Invite resent", "Patient received the same code again.");
        } catch (sendError) {
          const message = sendError instanceof Error ? sendError.message : "EmailJS failed to send the invite.";
          toast.error("Email send failed", message);
        }
      }
      router.refresh();
    });
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`${viewBasePath}/${encodeURIComponent(patientId)}` as Route);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-glass backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">Patient Directory</p>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{pageStart}-{pageEnd}</span> of{" "}
            <span className="font-semibold text-foreground">{rows.length}</span> care records
          </p>
        </div>
        {totalPages > 1 ? (
          <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
            Page {currentPage} of {totalPages}
          </div>
        ) : null}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name / Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Care Plan</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">{row.name}</span>
                  <span className="text-xs text-muted-foreground">{row.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={riskVariant[row.riskLevel]}>{row.riskLevel}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-foreground">{row.carePlan}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {row.status === "Active" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      aria-label={`View ${row.name}`}
                      onClick={() => handleViewPatient(row.id)}
                    >
                      <Eye data-icon="inline-start" />
                    </Button>
                  ) : null}
                  <DropdownMenu
                    open={openRowId === row.id}
                    onOpenChange={(open) => setOpenRowId(open ? row.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="secondary" size="sm" aria-label="Open actions">
                        <MoreVertical data-icon="inline-start" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className="z-[1000]">
                      {row.status === "Active" ? (
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => {}}>View Profile</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {}}>Adjust Care Plan</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {}}>Message</DropdownMenuItem>
                        </DropdownMenuGroup>
                      ) : (
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onSelect={() => handleResendInvite(row.id)}
                            disabled={isPending && resendingId === row.id}
                          >
                            Resend Invitation
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleCopyInvite(row.inviteCode)}>
                            Copy Invite Code
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleRevokeInvite(row.id)}
                            disabled={isPending && revokingId === row.id}
                          >
                            Revoke Invite
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 ? (
        <div className="flex justify-end border-t border-white/10 px-5 py-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={currentPage === 1 || isPending}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            {pageNumbers.map((page) => (
              <Button
                key={page}
                type="button"
                size="sm"
                variant={page === currentPage ? "default" : "secondary"}
                className={page === currentPage ? "shadow-[0_12px_30px_rgba(16,185,129,0.28)]" : ""}
                disabled={isPending}
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages || isPending}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
