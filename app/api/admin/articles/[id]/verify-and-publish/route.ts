import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

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

  // 1) admin auth check
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

  // 2) fetch article check
  const { data: article, error: articleErr } = await supabase
    .from("articles")
    .select("*, profiles(email, full_name)")
    .eq("id", articleId)
    .maybeSingle();

  if (articleErr || !article)
    return NextResponse.json({ error: "Article not found" }, { status: 404 });

  if (!article.approved || !article.payment_submitted) {
    return NextResponse.json(
      { error: "Article not ready for verify+publish" },
      { status: 400 }
    );
  }

  // 3) transactionally update article
  const { error: updateErr } = await supabase
    .from("articles")
    .update({ payment_done: true, published: true })
    .eq("id", articleId);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // 4) send combined email
  const authorEmail = article.profiles?.email;
  const authorName = article.profiles?.full_name ?? "Author";
  const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${
    article.slug ?? article.id
  }`;

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

    const mailHtml = `
      <p>Hi ${authorName},</p>
      <p>We have received your payment for the article "<strong>${article.title}</strong>".</p>
      <p>Your article is now <strong>published</strong> and live at:</p>
      <p><a href="${articleUrl}">${articleUrl}</a></p>
      <p>Thanks for your contribution!</p>
      <p>— Law Journal Team</p>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: authorEmail,
      subject: "[Law Journal] Payment received & your article is now live",
      html: mailHtml,
      text: `Payment received for "${article.title}". View: ${articleUrl}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Mail error", err);
    return NextResponse.json(
      { error: "Failed to send email: " + err.message },
      { status: 500 }
    );
  }
}
