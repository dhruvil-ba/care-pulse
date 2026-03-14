"use client";

import emailjs from "@emailjs/browser";

type InviteEmailPayload = {
  to: string;
  inviteCode: string;
  providerName?: string | null;
  title: string;
  message: string;
  fromEmail?: string | null;
};

const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? process.env.EMAILJS_SERVICE_ID;
const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? process.env.EMAILJS_TEMPLATE_ID;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? process.env.EMAILJS_PUBLIC_KEY;

export async function sendInviteEmail({ to, inviteCode, providerName, title, message, fromEmail }: InviteEmailPayload) {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS env vars are missing.");
  }

  const defaultFrom =
    process.env.NEXT_PUBLIC_EMAILJS_FROM_EMAIL ?? process.env.EMAILJS_FROM_EMAIL ?? "dhruvil.gajjar@bacancy.com";
  return emailjs.send(
    serviceId,
    templateId,
    {
      to_email: to,
      patient_email: to,
      invite_code: inviteCode,
      provider_name: providerName ?? "",
      title,
      message,
      from_email: fromEmail ?? defaultFrom
    },
    {
      publicKey
    }
  );
}
