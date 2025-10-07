// app/api/admin/articles/[id]/reject/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

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
    }
  );
  const articleId = context.params.id;
  const body = await req.json();
  const reason = (body?.rejection_reason || "").trim();

  if (!reason || reason.length < 10) {
    return NextResponse.json(
      { error: "rejection_reason required (min 10 chars)" },
      { status: 400 }
    );
  }

  // Auth & admin check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin)
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  // Fetch article + author email
  const { data: article, error: articleErr } = await supabase
    .from("articles")
    .select("*, profiles(email, full_name)")
    .eq("id", articleId)
    .maybeSingle();

  if (articleErr || !article)
    return NextResponse.json({ error: "Article not found" }, { status: 404 });

  // Update DB
  const { error: updateErr } = await supabase
    .from("articles")
    .update({ approved: false, rejection_reason: reason })
    .eq("id", articleId);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Send rejection email
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

    const authorEmail = article.profiles?.email;
    const authorName = article.profiles?.full_name ?? "Author";

    const mailHtml = `
      <p>Dear ${authorName},</p>

<p>We sincerely appreciate your submission titled "<strong>${article.title}</strong>" to <b>Clause & Claws</b>. After a thorough review by our editorial team, we regret to inform you that the article has not been accepted for publication at this stage.</p>

<p><b>Reason for Rejection:</b></p>
<blockquote style="color:#c62828; margin:12px 0; padding:8px 12px; border-left:4px solid #c62828; background-color:#fdecea;">
  ${reason}
</blockquote>

<p>We genuinely value the time, effort, and thought you have invested in preparing your manuscript. You are welcome to revise your article in light of the feedback and resubmit it through your Dashboard → <b>Submit Article</b> section for further consideration.</p>

<p>Thank you for your interest in contributing to <b>Clause & Claws</b>. We encourage you to continue sharing your insights and scholarly work with us in the future.</p>

<p>Warm regards,</p>
<p><b>Editorial Team</b><br />
<b>Clause & Claws Journal</b></p>

    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: authorEmail,
      subject: `[Clause & Claws] Your submission has been rejected`,
      html: mailHtml,
      text: `Your article "${article.title}" was rejected. Reason: ${reason}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Rejection mail error:", err);
    return NextResponse.json(
      { error: "Updated DB but failed to send email: " + err.message },
      { status: 500 }
    );
  }
}
