// app/api/coauthor/invite/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendCoAuthorInvitations } from "@/lib/coauthor-mailer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request): Promise<NextResponse> {
  try {
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

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { articleId, articleTitle, articleSlug, mainAuthorName, coauthorIds } =
      await req.json();

    // Validate inputs
    if (
      !articleId ||
      !articleTitle ||
      !articleSlug ||
      !mainAuthorName ||
      !coauthorIds ||
      !Array.isArray(coauthorIds)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the user is the article author
    const { data: article, error: articleErr } = await supabase
      .from("articles")
      .select("author_id")
      .eq("id", articleId)
      .single();

    if (articleErr || !article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (article.author_id !== user.id) {
      return NextResponse.json(
        { error: "Only the article author can send invitations" },
        { status: 403 }
      );
    }

    // Send invitations
    const result = await sendCoAuthorInvitations({
      articleId,
      articleTitle,
      articleSlug,
      mainAuthorName,
      coauthorIds,
    });

    if (result.errors && result.errors.length > 0) {
      return NextResponse.json({
        success: true,
        sent: result.sent,
        total: result.total,
        warnings: result.errors,
      });
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      total: result.total,
      message: `Successfully sent ${result.sent} invitation(s)`,
    });
  } catch (err: any) {
    console.error("Invite co-author error:", err);
    return NextResponse.json(
      { error: "Failed to send invitations: " + err.message },
      { status: 500 }
    );
  }
}