import { NextResponse } from "next/server";
import { getZohoAuthUrl } from "@/lib/zoho/auth";

export async function GET() {
  const authUrl = getZohoAuthUrl();
  return NextResponse.redirect(authUrl);
}
