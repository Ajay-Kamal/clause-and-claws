import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
const cookiesStore = await cookies();
  const supabase = await createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookiesStore.get(name)?.value;
        },
      },
    }
  );
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";

  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  // Lookup token (no auth required)
  const { data: tkn, error: tErr } = await supabase
    .from("utr_submission_tokens")
    .select("id, token, article_id, user_id, expires_at, used, created_at")
    .eq("token", token)
    .maybeSingle();

  if (tErr || !tkn) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  if (tkn.used) return NextResponse.json({ error: "Token already used" }, { status: 400 });
  if (new Date(tkn.expires_at) < new Date()) return NextResponse.json({ error: "Token expired" }, { status: 400 });

  // Fetch article info separately (safe, no auth)
  const { data: article, error: articleErr } = await supabase
    .from("articles")
    .select("id, title, slug")
    .eq("id", tkn.article_id)
    .maybeSingle();

  if (articleErr || !article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    token: tkn.token,
    article: { id: article.id, title: article.title, slug: article.slug },
    expires_at: tkn.expires_at,
  });
}
