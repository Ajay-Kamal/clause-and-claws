// app/api/payment/submit-utr/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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
  const body = await req.json();
  const { token, utr_number } = body || {};

  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
  if (!utr_number || String(utr_number).trim().length < 3) {
    return NextResponse.json({ error: "utr_number required" }, { status: 400 });
  }

  // fetch token
  const { data: tkn, error: tErr } = await supabase
    .from("utr_submission_tokens")
    .select("id, token, article_id, user_id, expires_at, used")
    .eq("token", token)
    .maybeSingle();

  if (tErr || !tkn) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  if (tkn.used) return NextResponse.json({ error: "Token already used" }, { status: 400 });
  if (new Date(tkn.expires_at) < new Date()) return NextResponse.json({ error: "Token expired" }, { status: 400 });

  // Update article: store UTR and set payment_submitted = true
  const { error: updErr } = await supabase
    .from("articles")
    .update({ utr_number: utr_number.trim(), payment_submitted: true })
    .eq("id", tkn.article_id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // Mark token used (best-effort)
  const { error: markErr } = await supabase
    .from("utr_submission_tokens")
    .update({ used: true })
    .eq("id", tkn.id);

  if (markErr) {
    console.error("Failed marking token used:", markErr);
    // still return success since article has utr
    return NextResponse.json({ success: true, warning: "UTR saved but token marking failed" });
  }

  return NextResponse.json({ success: true });
}
