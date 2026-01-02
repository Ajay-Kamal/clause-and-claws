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

// Helper function to calculate impact score
const calculateImpactScore = (articleCount: number, views: number, likes: number): number => {
  return (articleCount * 50) + (views * 2) + (likes * 10);
};

// Helper function to normalize scores to 0-10 scale
const normalizeImpactScores = (authors: any[]) => {
  const authorsWithArticles = authors.filter(a => a.articleCount > 0);
  
  if (authorsWithArticles.length === 0) {
    return authors.map(a => ({ ...a, impactScore: 0 }));
  }
  
  // Find max and min raw scores
  const rawScores = authorsWithArticles.map(a => a.rawImpactScore);
  const maxScore = Math.max(...rawScores);
  const minScore = Math.min(...rawScores);
  
  return authors.map(author => {
    if (author.articleCount === 0) {
      return { ...author, impactScore: 0 };
    }
    
    // Scale from 1-10 for authors with articles
    if (maxScore === minScore) {
      return { ...author, impactScore: 10 };
    }
    
    const normalized = 1 + ((author.rawImpactScore - minScore) / (maxScore - minScore)) * 9;
    return { ...author, impactScore: parseFloat(normalized.toFixed(2)) };
  });
};

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

  // ✅ UPDATED: Fetch articles with views and likes
  const { data: authorsData, error: authorsError } = await supabase
    .from("articles")
    .select("author_id, views, likes")
    .eq("published", true)
    .eq("approved", true)
    .eq("payment_done", true);

  if (authorsError) {
    console.error("Error fetching authors data:", authorsError);
    notFound();
  }

  // ✅ UPDATED: Calculate stats including views and likes
  const authorStats = authorsData.reduce((acc: any, article: any) => {
    const authorId = article.author_id;
    if (!acc[authorId]) {
      acc[authorId] = {
        articleCount: 0,
        totalViews: 0,
        totalLikes: 0,
      };
    }
    acc[authorId].articleCount += 1;
    acc[authorId].totalViews += article.views || 0;
    acc[authorId].totalLikes += article.likes || 0;
    return acc;
  }, {});

  const authorIds = Object.keys(authorStats);

  // Fetch ALL author profiles
  const { data: authors, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", authorIds)
    .order("follower_count", { ascending: false });

  if (error) {
    console.error("Error fetching authors:", error);
    notFound();
  }

  // ✅ UPDATED: Calculate raw impact scores
  const authorsWithRawScores = authors?.map((author) => {
    const stats = authorStats[author.id] || { articleCount: 0, totalViews: 0, totalLikes: 0 };
    const rawScore = calculateImpactScore(stats.articleCount, stats.totalViews, stats.totalLikes);
    
    return {
      ...author,
      articleCount: stats.articleCount,
      totalViews: stats.totalViews,
      totalLikes: stats.totalLikes,
      rawImpactScore: rawScore,
    };
  }) || [];

  // ✅ UPDATED: Normalize scores to 0-10 scale
  const authorsWithNormalizedScores = normalizeImpactScores(authorsWithRawScores);

  return (
    <AuthorsClient 
      authors={authorsWithNormalizedScores} 
      authorsPerPage={AUTHORS_PER_PAGE}
      initialPage={currentPage}
    />
  );
}