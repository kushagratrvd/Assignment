import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getValidAccessToken, refreshAccessToken, setAuthCookies } from "@/lib/zoho/auth";
import { fetchBulkEmployees, normalizeZohoRecords } from "@/lib/zoho/people";

export async function GET(request: NextRequest) {
  let accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with Zoho People" },
      { status: 401 }
    );
  }

  // Parse pagination params
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const sIndex = (page - 1) * limit + 1;

  try {
    let data = await fetchBulkEmployees(accessToken, sIndex, limit);

    // If Zoho reports invalid or expired token, attempt refresh once
    if (data?.error === "invalid_token" || data?.response?.status === 7000) {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("zoho_refresh_token")?.value;

      if (refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken);
        if (refreshed?.access_token) {
          accessToken = refreshed.access_token;
          await setAuthCookies({
            access_token: refreshed.access_token,
            expires_in: refreshed.expires_in,
          });
          // Retry request once
          data = await fetchBulkEmployees(accessToken, sIndex, limit);
        }
      }
    }

    const users = normalizeZohoRecords(data);

    return NextResponse.json({
      users,
      page,
      limit,
      hasMore: users.length === limit,
    });
  } catch (err: any) {
    console.error("Error fetching Zoho users:", err);
    return NextResponse.json(
      { error: "Failed to fetch employees from Zoho People" },
      { status: 500 }
    );
  }
}
