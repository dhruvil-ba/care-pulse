import { NextResponse } from "next/server";
import { acceptInvitation } from "@/app/actions/invitations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = Array.isArray(body) ? body[0] : body;

    if (!payload) {
      return NextResponse.json({ error: "Missing payload." }, { status: 400 });
    }

    const result = await acceptInvitation(payload);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
