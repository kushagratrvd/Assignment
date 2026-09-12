import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has("zoho_access_token");
  const hasRefreshToken = cookieStore.has("zoho_refresh_token");

  return NextResponse.json({
    authenticated: hasAccessToken || hasRefreshToken,
  });
}
