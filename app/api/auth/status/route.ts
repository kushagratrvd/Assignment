import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has("zoho_access_token");
  const hasRefreshToken = cookieStore.has("zoho_refresh_token");
  const location = cookieStore.get("zoho_location")?.value;
  const accountsServer = cookieStore.get("zoho_accounts_server")?.value;

  return NextResponse.json({
    authenticated: hasAccessToken || hasRefreshToken,
    location,
    accountsServer,
  });
}
