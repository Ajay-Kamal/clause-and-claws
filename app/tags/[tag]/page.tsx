import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import TagPageClient from "../../../components/TagPageClient";

export default async function TagPage({ params }: { params: { tag: string } }) {
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

  const tag = decodeURIComponent(params.tag);

  const { data: initialArticles, error } = await supabase
    .from("articles")
    .select("*")
    .contains("tags", [tag])
    .order("created_at", { ascending: false })
    .eq("published", true)
    .eq("approved", true)
    .eq("payment_done", true)
    .limit(10);

  if (error) {
    console.error(error); 
    notFound();
  }

  return <TagPageClient tag={tag} initialArticles={initialArticles || []} />;
}
