// app/api/admin/articles/[id]/reject/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

export async function POST(req: Request, context: { params: { id: string } }) {
  const cookiesStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies:{
      get(name: string) {
        return cookiesStore.get(name)?.value;
      }
    } }
  );
  const articleId = context.params.id;
  const body = await req.json();
  const reason = (body?.rejection_reason || "").trim();

  if (!reason || reason.length < 10) {
    return NextResponse.json({ error: "rejection_reason required (min 10 chars)" }, { status: 400 });
  }

  // Auth & admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  // Fetch article + author email
  const { data: article, error: articleErr } = await supabase
    .from("articles")
    .select("*, profiles(email, full_name)")
    .eq("id", articleId)
    .maybeSingle();

  if (articleErr || !article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  // Update DB
  const { error: updateErr } = await supabase
    .from("articles")
    .update({ approved: false, rejection_reason: reason })
    .eq("id", articleId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

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
      <p>Hi ${authorName},</p>
      <p>We reviewed your article "<strong>${article.title}</strong>" and it has been <strong>rejected</strong> for the following reason:</p>
      <blockquote style="color:#c62828;">${reason}</blockquote>
      <p>If you'd like to try again, please submit a <strong>new</strong> article via your Dashboard → Submit Article.</p>
      <p>— Law Journal Team</p>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: authorEmail,
      subject: `[Law Journal] Your submission has been rejected`,
      html: mailHtml,
      text: `Your article "${article.title}" was rejected. Reason: ${reason}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Rejection mail error:", err);
    return NextResponse.json({ error: "Updated DB but failed to send email: " + err.message }, { status: 500 });
  }
}
