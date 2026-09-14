import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getValidAccessToken, getZohoPeopleBaseUrl, refreshAccessToken, setAuthCookies } from "@/lib/zoho/auth";
import { fetchAllEmployees } from "@/lib/zoho/people";

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
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  // Resolve user's data-center-specific Zoho People base URL
  const peopleBaseUrl = await getZohoPeopleBaseUrl();

  try {
    let result = await fetchAllEmployees(accessToken, peopleBaseUrl);

    // If Zoho reports invalid or expired token, attempt refresh once
    if (result.isAuthError) {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("zoho_refresh_token")?.value;
      const accountsServer = cookieStore.get("zoho_accounts_server")?.value;

      if (refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken, accountsServer);
        if (refreshed?.access_token) {
          accessToken = refreshed.access_token;
          await setAuthCookies({
            access_token: refreshed.access_token,
            expires_in: refreshed.expires_in,
            accounts_server: accountsServer,
            api_domain: refreshed.api_domain,
          });
          // Retry request once
          result = await fetchAllEmployees(accessToken, peopleBaseUrl);
        }
      }
    }

    const allUsers = result.users;
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const hasMore = page < totalPages;

    const startIndex = (page - 1) * limit;
    const users = allUsers.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      users,
      page,
      limit,
      total,
      totalPages,
      hasMore,
    });
  } catch (err: any) {
    console.error("Error fetching Zoho users:", err);
    return NextResponse.json(
      { error: "Failed to fetch employees from Zoho People" },
      { status: 500 }
    );
  }
}
