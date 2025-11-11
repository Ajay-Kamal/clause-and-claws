export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  context: any
): Promise<NextResponse> {
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

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check admin status
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get the update data from request body
    const body = await request.json();
    const { is_editor, editor_role, institution, editor_order } = body;

    // Await context.params - THIS IS THE FIX
    const params = await context.params;

    // Prepare update data
    const updateData: any = { is_editor };

    if (is_editor) {
      updateData.editor_role = editor_role;
      updateData.institution = institution;
      updateData.editor_order = editor_order;
    } else {
      // If removing editor status, clear editor fields
      updateData.editor_role = null;
      updateData.institution = null;
      updateData.editor_order = null;
    }

    // Update the profile - USE params.id instead of context.params.id
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", params.id);

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch the updated profile - USE params.id
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single();

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error("Error in toggle-editor API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}