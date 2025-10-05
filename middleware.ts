// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = [
  "/payment/submit-utr",
  "/api/payment/validate-token",
  "/api/payment/submit-utr",
  "/api/public",
  "/.well-known",
];

function isPublicPath(pathname: string) {
  for (const p of PUBLIC_PATHS) {
    if (pathname === p || pathname.startsWith(p + "/")) return true;
  }
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico"
  )
    return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  if (isPublicPath(pathname) || pathname.startsWith("/auth/")) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set(name, value, options);
        },
        remove: (name: string, options: any) => {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.warn("Middleware: supabase.getSession() error:", error.message);
      return res;
    }

    const user = session?.user ?? null;

    if (!user) {
      return res;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Middleware profile error:", profileError);
      return res;
    }

    if (!profile) {
      return res;
    }

    const needsOnboarding = !profile.username || !profile.full_name;
    if (needsOnboarding && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return res;
  } catch (err) {
    console.error("Middleware unexpected error:", err);
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth|supabase).*)",
  ],
};
