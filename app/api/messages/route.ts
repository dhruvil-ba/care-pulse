import { createMessage, listMessages } from "@/lib/in-memory-store";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  sender_id: z.string().min(1),
  receiver_id: z.string().min(1),
  message_content: z.string().min(1),
  is_read: z.boolean().optional()
});

export async function GET() {
  return NextResponse.json({ data: listMessages() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({ data: createMessage(parsed.data) }, { status: 201 });
}
