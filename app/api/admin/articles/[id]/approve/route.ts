export const runtime = "nodejs";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request, context: any): Promise<NextResponse> {
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

  const qrDataUrl =
    "https://rvydvbikckoourvzhyml.supabase.co/storage/v1/object/public/QR%20Code/WhatsApp%20Image%202025-10-05%20at%2001.39.57_5500854d.jpg";

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
      <p>Dear ${authorName},</p>

        <p>We are pleased to inform you that your article titled "<strong>${article.title}</strong>" has been reviewed and approved by our editorial team for publication in the <b>Clause & Claws Journal</b>.</p>

        <p>We truly appreciate the effort and quality of work you have invested in preparing this submission.</p>

        <p>As part of the publication process, we kindly request you to complete the payment at your convenience using the QR code provided below or through the UPI ID mentioned.</p>

        <p><b>Article Token:</b> ${article.slug}</p>

        <p><b>QR Code:</b><br />
        <img src="${qrDataUrl}" alt="QR Code" style="max-width:240px;" /></p>

        <p>If the QR code is not displayed, please use this UPI ID: <b>6267535508@ptyes</b></p>

        <p>Once the payment has been completed, please submit your UTR (transaction reference number) through the secure link provided below:</p>

        <p><b>Submit UTR:</b> <a href="${utrLink}" target="_blank" rel="noopener">${utrLink}</a></p>

        <p><b>Kindly note the following:</b></p>
        <ul>
          <li>This link is unique to your article and is valid for <b>48 hours</b> only.</li>
          <li>It should be used solely by you for this transaction.</li>
          <li>Upon verification of the payment, you will receive a confirmation email along with details regarding the next steps of the publication process.</li>
        </ul>

        <p>Your contribution is valuable to our journal, and we are committed to ensuring a seamless and professional publishing experience. Should you encounter any difficulties in completing the payment or submission process, please do not hesitate to contact us at <b>clauseandclaws@gmail.com</b>.</p>

        <p>We thank you once again for your trust in Clause & Claws and look forward to showcasing your article to our readers.</p>

        <p>Warm regards,</p>
        <p><b>Editorial Team</b><br />
        <b>Clause & Claws</b></p>

    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: authorEmail,
      subject:
        "[Clause and Claws] Your article has been approved — Payment Request for Your Approved Article",
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
