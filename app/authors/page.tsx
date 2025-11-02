// app/authors/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AuthorsClient from "./AuthorPageClient";

// Optional: Add metadata for SEO
export const metadata = {
  title: "All Authors",
  description: "Browse all authors and their published work",
};

const AUTHORS_PER_PAGE = 12;

export default async function AuthorsPage({ searchParams }: any) {
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

  // Get current page from URL params, default to 1
  const currentPage = Number(searchParams.page) || 1;

  // First, get authors who have published articles with counts
  const { data: authorsData, error: authorsError } = await supabase
    .from("articles")
    .select("author_id")
    .eq("published", true)
    .eq("approved", true)
    .eq("payment_done", true);

  if (authorsError) {
    console.error("Error fetching authors data:", authorsError);
    notFound();
  }

  // Calculate stats for each author
  const authorStats = authorsData.reduce((acc: any, article: any) => {
    const authorId = article.author_id;
    if (!acc[authorId]) {
      acc[authorId] = {
        articleCount: 0,
        totalReads: 0,
      };
    }
    acc[authorId].articleCount += 1;
    acc[authorId].totalReads += article.read_time || 0;
    return acc;
  }, {});

  const authorIds = Object.keys(authorStats);

  // Fetch ALL author profiles (not paginated) for client-side search
  const { data: authors, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", authorIds)
    .order("follower_count", { ascending: false });

  if (error) {
    console.error("Error fetching authors:", error);
    notFound();
  }

  // Merge author profiles with their stats
  const authorsWithStats = authors?.map((author) => ({
    ...author,
    articleCount: authorStats[author.id]?.articleCount || 0,
    totalReads: authorStats[author.id]?.totalReads || 0,
  }));

  return (
    <AuthorsClient 
      authors={authorsWithStats || []} 
      authorsPerPage={AUTHORS_PER_PAGE}
      initialPage={currentPage}
    />
  );
}