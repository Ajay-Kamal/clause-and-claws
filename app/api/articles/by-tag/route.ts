import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!tag) return new Response(JSON.stringify([]), { status: 400 });
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .contains("tags", [tag])
    .order("created_at", { ascending: false })
    .range(page * 10, page * 10 + 9);

  if (error) {
    console.error(error);
    return new Response(JSON.stringify([]), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
