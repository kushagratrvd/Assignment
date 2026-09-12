import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, setAuthCookies } from "@/lib/zoho/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_code`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (tokens.error || !tokens.access_token) {
      const errMsg = tokens.error_description || tokens.error || "failed_token_exchange";
      return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(errMsg)}`);
    }

    await setAuthCookies({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    });

    return NextResponse.redirect(`${baseUrl}/`);
  } catch (err: any) {
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(err.message || "exchange_error")}`);
  }
}
