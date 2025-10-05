export const runtime = "nodejs";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";
import QRCode from "qrcode";

export async function POST(req: Request, context: { params: { id: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const articleId = context.params.id;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // check admin flag
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, email, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin)
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  // 2) fetch article & author
  const { data: article, error: articleErr } = await supabase
    .from("articles")
    .select("*, profiles(email, full_name)")
    .eq("id", articleId)
    .maybeSingle();

  if (articleErr || !article)
    return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const authorEmail = article.profiles?.email;
  const authorName = article.profiles?.full_name ?? "Author";

  // 3) update article to approved
  const { error: updateErr } = await supabase
    .from("articles")
    .update({
      approved: true,
      payment_submitted: false,
      rejection_reason: null,
    })
    .eq("id", articleId);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // 4) create secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

  const { error: tokenErr } = await supabase
    .from("utr_submission_tokens")
    .insert([
      {
        token,
        article_id: articleId,
        user_id: article.author_id,
        expires_at: expiresAt,
      },
    ]);

  if (tokenErr)
    return NextResponse.json({ error: tokenErr.message }, { status: 500 });

  const qrDataUrl = "https://rvydvbikckoourvzhyml.supabase.co/storage/v1/object/public/QR%20Code/WhatsApp%20Image%202025-10-05%20at%2001.39.57_5500854d.jpg";

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const utrLink = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/submit-utr?token=${token}`;

    const mailHtml = `
      <p>Hi ${authorName},</p>
      <p>Your article "<strong>${article.title}</strong>" has been approved by the editors. Please complete payment using the QR code below or your banking app.</p>
      <p>This is your token for your article<b>${article.slug}</b></p>
      <p><img src="${qrDataUrl}" alt="QR code" style="max-width:240px" /></p>
      <p>After payment, submit your UTR (transaction reference) here:</p>
      <p><a href="${utrLink}">${utrLink}</a></p>
      <p>This link expires in 48 hours and can only be used by you.</p>
      <p>Thanks,<br/>Law Journal Team</p>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: authorEmail,
      subject:
        "[Clause and Claws] Your article has been approved — submit payment",
      html: mailHtml,
      text: `Hi ${authorName},\nYour article "${article.title}" has been approved. Submit UTR: ${utrLink}`,
    });

    return NextResponse.json({ success: true, expires_at: expiresAt });
  } catch (err: any) {
    console.error("Mail error", err);
    return NextResponse.json(
      { error: "Failed to send email: " + err.message },
      { status: 500 }
    );
  }
}
