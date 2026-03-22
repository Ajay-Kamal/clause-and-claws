// app/api/admin/articles/[id]/resend-approval/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

export async function POST(req: Request, context: any) {
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
    },
  );
  const articleId = context.params.id;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin)
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { data: article, error: articleErr } = await supabase
    .from("articles")
    .select("*, profiles(email, full_name)")
    .eq("id", articleId)
    .maybeSingle();

  if (articleErr || !article)
    return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { error: tokenErr } = await supabase
    .from("utr_submission_tokens")
    .insert([{ token, article_id: articleId, user_id: article.author_id, expires_at: expiresAt }]);
  if (tokenErr)
    return NextResponse.json({ error: tokenErr.message }, { status: 500 });

  try {
    // ✅ Generate QR as a Buffer (not base64 data URL)
    const paymentQRContent = `upi://pay?pa=yourupi@bank&pn=LawJournal&tn=Payment for ${article.title}`;
    const qrBuffer = await QRCode.toBuffer(paymentQRContent, { width: 240 });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // ⚠️ Must be a Gmail App Password, not your login password
      },
    });

    const utrLink = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/submit-utr?token=${token}`;

    const mailHtml = `
      <p>Dear ${article.profiles?.full_name ?? "Author"},</p>

      <p>This is a resend notification regarding your article titled "<strong>${article.title}</strong>",
      which has been <strong style="color:#2e7d32;">approved</strong> for publication in the
      <b>Clause &amp; Claws Journal</b>.</p>

      <p>To proceed, please complete the payment using the QR code below and submit your UTR
      (transaction reference number) through the secure link provided.</p>

      <p><b>QR Code:</b><br />
      <img src="cid:payment-qr" alt="Payment QR Code" style="max-width:240px; margin-top:6px;" /></p>

      <p><b>Submit UTR:</b> <a href="${utrLink}" target="_blank" rel="noopener">${utrLink}</a></p>

      <p><b>Expires:</b> ${expiresAt}</p>

      <p>If you encounter any issues, please contact us at <b>clauseandclaws@gmail.com</b>.</p>

      <p>Thank you for your valuable contribution to <b>Clause &amp; Claws</b>.
      We look forward to publishing your work soon.</p>

      <p>Warm regards,<br />
      <b>Editorial Team</b><br />
      <b>Clause &amp; Claws Journal</b></p>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: article.profiles?.email,
      subject: "[Clause & Claws] Approval link (resend) — submit UTR",
      html: mailHtml,
      // ✅ QR attached as inline image, referenced via cid:payment-qr
      attachments: [
        {
          filename: "payment-qr.png",
          content: qrBuffer,
          cid: "payment-qr",
          contentDisposition: "inline",
        },
      ],
    });

    return NextResponse.json({ success: true, expires_at: expiresAt });
  } catch (err: any) {
    console.error("Resend mail error", err);
    return NextResponse.json(
      { error: "Failed to send email: " + err.message },
      { status: 500 },
    );
  }
}