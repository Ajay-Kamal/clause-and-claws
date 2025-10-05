// app/api/admin/articles/[id]/resend-approval/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

export async function POST(req: Request, context: { params: { id: string } }) {
  const cookiesStore = await cookies();
  const supabase = createServerClient(
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
  const articleId = context.params.id;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { data: article, error: articleErr } = await supabase
    .from("articles")
    .select("*, profiles(email, full_name)")
    .eq("id", articleId)
    .maybeSingle();

  if (articleErr || !article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  // create token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { error: tokenErr } = await supabase.from("utr_submission_tokens").insert([
    { token, article_id: articleId, user_id: article.author_id, expires_at: expiresAt },
  ]);
  if (tokenErr) return NextResponse.json({ error: tokenErr.message }, { status: 500 });

  // send email (QR)
  const paymentQRContent = `UPI://pay?pa=yourupi@bank&pn=LawJournal&tn=Payment for ${article.title}`;
  const qrDataUrl = await QRCode.toDataURL(paymentQRContent);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const utrLink = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/submit-utr?token=${token}`;
    const mailHtml = `
      <p>Hi ${article.profiles?.full_name ?? "Author"},</p>
      <p>This is a resend — your article "<strong>${article.title}</strong>" is approved. Please pay and submit UTR:</p>
      <p><img src="${qrDataUrl}" alt="QR" style="max-width:240px"/></p>
      <p><a href="${utrLink}">${utrLink}</a></p>
      <p>Expires: ${expiresAt}</p>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: article.profiles?.email,
      subject: "[Law Journal] Approval link (resend) — submit UTR",
      html: mailHtml,
    });

    return NextResponse.json({ success: true, expires_at: expiresAt });
  } catch (err: any) {
    console.error("Resend mail error", err);
    return NextResponse.json({ error: "Failed to send email: " + err.message }, { status: 500 });
  }
}
