import { cookies } from "next/headers";

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || "";
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || "";
const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI || "";
const ZOHO_ACCOUNTS_URL = (process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in").replace(/\/$/, "");

// 1. Generate Zoho Authorization URL
export function getZohoAuthUrl() {
  const params = new URLSearchParams({
    scope: "ZOHOPEOPLE.forms.READ",
    client_id: ZOHO_CLIENT_ID,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    redirect_uri: ZOHO_REDIRECT_URI,
  });
  return `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?${params.toString()}`;
}

// 2. Exchange code for access & refresh tokens
export async function exchangeCodeForTokens(code: string, accountsServer?: string | null) {
  const server = (accountsServer || ZOHO_ACCOUNTS_URL).replace(/\/$/, "");
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: ZOHO_REDIRECT_URI,
    code,
  });

  const res = await fetch(`${server}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  return await res.json();
}

// 3. Refresh access token using refresh token and the user's accounts server
export async function refreshAccessToken(refreshToken: string, accountsServer?: string | null) {
  let server = accountsServer;
  if (!server) {
    const cookieStore = await cookies();
    server = cookieStore.get("zoho_accounts_server")?.value;
  }
  const targetServer = (server || ZOHO_ACCOUNTS_URL).replace(/\/$/, "");

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const res = await fetch(`${targetServer}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  return await res.json();
}

// 4. Store tokens and DC metadata in secure HttpOnly cookies
export async function setAuthCookies(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  accounts_server?: string;
  api_domain?: string;
  location?: string;
}) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("zoho_access_token", tokens.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in || 3600,
  });

  if (tokens.refresh_token) {
    cookieStore.set("zoho_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600, // 30 days
    });
  }

  if (tokens.accounts_server) {
    cookieStore.set("zoho_accounts_server", tokens.accounts_server, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });
  }

  if (tokens.api_domain) {
    cookieStore.set("zoho_api_domain", tokens.api_domain, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });
  }

  if (tokens.location) {
    cookieStore.set("zoho_location", tokens.location, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });
  }
}

// 5. Clear cookies on logout
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("zoho_access_token");
  cookieStore.delete("zoho_refresh_token");
  cookieStore.delete("zoho_accounts_server");
  cookieStore.delete("zoho_api_domain");
  cookieStore.delete("zoho_location");
}

// 6. Get a valid access token, auto-refreshing at the user's specific accounts server
export async function getValidAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("zoho_access_token")?.value;
  if (accessToken) return accessToken;

  const refreshToken = cookieStore.get("zoho_refresh_token")?.value;
  if (!refreshToken) return null;

  const accountsServer = cookieStore.get("zoho_accounts_server")?.value;

  try {
    const data = await refreshAccessToken(refreshToken, accountsServer);
    if (data.access_token) {
      await setAuthCookies({
        access_token: data.access_token,
        expires_in: data.expires_in,
        accounts_server: accountsServer,
        api_domain: data.api_domain,
      });
      return data.access_token;
    }
  } catch (err) {
    console.error("Token refresh failed:", err);
  }

  return null;
}

// 7. Resolve the Zoho People base URL from user's Multi-DC metadata
export function resolvePeopleBaseUrl(accountsServer?: string | null, apiDomain?: string | null): string {
  if (apiDomain) {
    if (apiDomain.includes("people.zoho.")) {
      return apiDomain.replace(/\/$/, "");
    }
    if (apiDomain.includes("zohoapis.")) {
      return apiDomain
        .replace("www.zohoapis.", "people.zoho.")
        .replace("zohoapis.", "people.zoho.")
        .replace(/\/$/, "");
    }
  }

  if (accountsServer) {
    return accountsServer.replace("accounts.", "people.").replace(/\/$/, "");
  }

  return (process.env.ZOHO_PEOPLE_BASE_URL || "https://people.zoho.in").replace(/\/$/, "");
}

// 8. Read the current user's Zoho People base URL from cookies
export async function getZohoPeopleBaseUrl(): Promise<string> {
  const cookieStore = await cookies();
  const accountsServer = cookieStore.get("zoho_accounts_server")?.value;
  const apiDomain = cookieStore.get("zoho_api_domain")?.value;

  return resolvePeopleBaseUrl(accountsServer, apiDomain);
}
