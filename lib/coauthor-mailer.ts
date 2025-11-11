// lib/coauthor-mailer.ts
import nodemailer from "nodemailer";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface CoAuthorInviteParams {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  mainAuthorName: string;
  coauthorIds: string[];
}

export async function sendCoAuthorInvitations({
  articleId,
  articleTitle,
  articleSlug,
  mainAuthorName,
  coauthorIds,
}: CoAuthorInviteParams) {
  if (coauthorIds.length === 0) return { success: true, sent: 0 };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const coauthorId of coauthorIds) {
    try {
      // 1. Fetch co-author details
      const { data: coauthor, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name, username")
        .eq("id", coauthorId)
        .single();

      if (profileErr || !coauthor?.email) {
        errors.push(`Co-author ${coauthorId} not found or no email`);
        continue;
      }

      // 2. Generate unique token (valid for 30 days)
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // 3. Update article_coauthors with token
      const { error: tokenErr } = await supabaseAdmin
        .from("article_coauthors")
        .update({
          invitation_token: token,
          token_expires_at: expiresAt,
        })
        .eq("article_id", articleId)
        .eq("coauthor_id", coauthorId);

      if (tokenErr) {
        errors.push(`Failed to create token for ${coauthor.email}: ${tokenErr.message}`);
        continue;
      }

      // 4. Prepare acceptance link
      const acceptLink = `${process.env.NEXT_PUBLIC_BASE_URL}/accept-coauthor?token=${token}`;
      const coauthorName = coauthor.full_name || coauthor.username || "Colleague";

      // 5. Email HTML content
      const mailHtml = `
        <p>Dear ${coauthorName},</p>

        <p>We are pleased to inform you that <strong>${mainAuthorName}</strong> has invited you to be listed as a co-author on their article titled "<strong>${articleTitle}</strong>" submitted to <b>Clause & Claws Journal</b>.</p>

        <p><b>Article Details:</b></p>
        <ul>
          <li><b>Title:</b> ${articleTitle}</li>
          <li><b>Main Author:</b> ${mainAuthorName}</li>
          <li><b>Article Token:</b> ${articleSlug}</li>
        </ul>

        <p>To confirm your co-authorship and have your name displayed on the published article, please click the button below to accept this invitation:</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${acceptLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Accept Co-Authorship
          </a>
        </p>

        <p>Or copy and paste this link into your browser:<br />
        <a href="${acceptLink}">${acceptLink}</a></p>

        <p><b>Important Notes:</b></p>
        <ul>
          <li>This invitation link is valid for <b>30 days</b> from the date of this email.</li>
          <li>By accepting, your name and profile will be publicly listed as a co-author on this article.</li>
          <li>If you did not contribute to this article or believe this invitation was sent in error, please disregard this email or contact us at <b>clauseandclaws@gmail.com</b>.</li>
        </ul>

        <p>We value academic integrity and ensure that all co-author attributions are accurate and consensual.</p>

        <p>If you have any questions or concerns, please don't hesitate to reach out to our editorial team.</p>

        <p>Warm regards,</p>
        <p><b>Editorial Team</b><br />
        <b>Clause & Claws Journal</b><br />
        <a href="mailto:clauseandclaws@gmail.com">clauseandclaws@gmail.com</a></p>
      `;

      // 6. Send email
      await transporter.sendMail({
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: coauthor.email,
        subject: `[Clause & Claws] Co-Author Invitation: "${articleTitle}"`,
        html: mailHtml,
        text: `Hi ${coauthorName},\n\n${mainAuthorName} has invited you as a co-author on "${articleTitle}".\n\nAccept here: ${acceptLink}\n\nThis link expires in 30 days.`,
      });

      sentCount++;
    } catch (err: any) {
      console.error(`Error sending invitation to ${coauthorId}:`, err);
      errors.push(`Failed to send to ${coauthorId}: ${err.message}`);
    }
  }

  return {
    success: sentCount > 0,
    sent: sentCount,
    total: coauthorIds.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}