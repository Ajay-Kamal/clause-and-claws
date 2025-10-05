import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/";

    if (code) {
      const cookieStore = await cookies();
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set(name, value, options);
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete(name);
            },
          },
        }
      );

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        // Redirect to error page or login page with error
        return NextResponse.redirect(
          `${request.nextUrl.origin}/auth/error?message=${encodeURIComponent(
            error.message
          )}`
        );
      }

      if (data?.user) {
        console.log("User authenticated:", data.user.email);
      }
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${request.nextUrl.origin}${next}`);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    const origin = request.nextUrl?.origin || request.url.split('/').slice(0, 3).join('/');
    return NextResponse.redirect(
      `${origin}/auth/error?message=Authentication failed`
    );
  }
}