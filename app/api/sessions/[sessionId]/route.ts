import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { updateSessionSchema } from "@/lib/schemas";
import {
  deleteSessionForUser,
  getSessionForUser,
  updateSessionForUser,
} from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { userId } = await auth();
  const { sessionId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const json = await request.json();
  const parsed = updateSessionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const session = await getSessionForUser(sessionId, userId);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  try {
    const updatedSession = await updateSessionForUser(sessionId, userId, parsed.data);
    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update this session right now.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { userId } = await auth();
  const { sessionId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const session = await getSessionForUser(sessionId, userId);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  try {
    await deleteSessionForUser(sessionId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to delete this session right now.",
      },
      { status: 500 },
    );
  }
}
