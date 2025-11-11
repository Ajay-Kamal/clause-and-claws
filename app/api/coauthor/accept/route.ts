// app/api/coauthor/accept/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // 1. Find the co-author invitation by token
    const { data: invitation, error: inviteErr } = await supabaseAdmin
      .from("article_coauthors")
      .select(
        `
        *,
        article:articles(id, title, slug, author_id),
        coauthor:profiles!coauthor_id(id, email, full_name, username)
      `
      )
      .eq("invitation_token", token)
      .maybeSingle();

    if (inviteErr || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 404 }
      );
    }

    // 2. Check if already accepted
    if (invitation.accepted) {
      return NextResponse.json(
        {
          error: "This invitation has already been accepted",
          already_accepted: true,
        },
        { status: 400 }
      );
    }

    // 3. Check token expiry
    if (
      invitation.token_expires_at &&
      new Date(invitation.token_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: "This invitation link has expired" },
        { status: 410 }
      );
    }

    // 4. Update to accepted
    const { error: updateErr } = await supabaseAdmin
      .from("article_coauthors")
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateErr) {
      console.error("Error accepting invitation:", updateErr);
      return NextResponse.json(
        { error: "Failed to accept invitation" },
        { status: 500 }
      );
    }

    // 5. Return success with article details
    return NextResponse.json({
      success: true,
      message: "Co-authorship accepted successfully!",
      article: {
        title: invitation.article.title,
        slug: invitation.article.slug,
      },
      coauthor: {
        name:
          invitation.coauthor.full_name ||
          invitation.coauthor.username ||
          "You",
      },
    });
  } catch (err: any) {
    console.error("Accept co-author error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token and get invitation details (optional)
export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const { data: invitation, error } = await supabaseAdmin
      .from("article_coauthors")
      .select(
        `
        *,
        article:articles(id, title, slug, abstract, author_id),
        coauthor:profiles!coauthor_id(id, full_name, username),
        main_author:articles(author:profiles!author_id(full_name, username))
      `
      )
      .eq("invitation_token", token)
      .maybeSingle();

    if (error || !invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if expired
    const isExpired =
      invitation.token_expires_at &&
      new Date(invitation.token_expires_at) < new Date();

    return NextResponse.json({
      valid: !isExpired && !invitation.accepted,
      already_accepted: invitation.accepted,
      expired: isExpired,
      article: {
        title: invitation.article.title,
        slug: invitation.article.slug,
        abstract: invitation.article.abstract,
      },
      main_author:
        invitation.article.author?.full_name ||
        invitation.article.author?.username ||
        "Author",
      coauthor_name:
        invitation.coauthor.full_name ||
        invitation.coauthor.username ||
        "You",
    });
  } catch (err: any) {
    console.error("Verify token error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}