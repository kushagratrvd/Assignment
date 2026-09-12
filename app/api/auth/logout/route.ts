import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/zoho/auth";

export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ success: true });
}
