import { NextResponse } from "next/server";

// NextAuth signOut is triggered on client; this endpoint is a convenience no-op
export async function POST() {
  return NextResponse.json({ success: true });
}
