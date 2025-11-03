import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";

const ARTICLES_PER_PAGE = 9;

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ type: string }> 
}) {
  const { type } = await params;
  const readableType = type.replace(/-/g, " ");
  return {
    title: `All ${readableType}`,
    description: `Browse all ${readableType}`,
  };
}

export default async function ArticleTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await params and searchParams
  const { type } = await params;
  const resolvedSearchParams = await searchParams;
  
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

  // Convert URL param like "book-reviews" → "Book Reviews"
  const readableType = type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const currentPage = Number(resolvedSearchParams.page) || 1;
  const from = (currentPage - 1) * ARTICLES_PER_PAGE;
  const to = from + ARTICLES_PER_PAGE - 1;

  const { data: articles, error, count } = await supabase
    .from("articles")
    .select(
      `*,
      profiles (
        full_name,
        username,
        avatar_url
      )`,
      { count: "exact" }
    )
    .eq("published", true)
    .eq("approved", true)
    .eq("payment_done", true)
    .eq("draft", false)
    .eq("type", readableType)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching articles:", error);
    notFound();
  }

  const totalPages = count ? Math.ceil(count / ARTICLES_PER_PAGE) : 0;

  if (currentPage < 1 || (totalPages > 0 && currentPage > totalPages)) {
    notFound();
  }

  return (
    <>
      <style>{`
      .articles-page {
        width: 100%;
        min-height: 100vh;
        padding: 2rem 1rem;
        background : rgb(246 246 246);
      }
      .articles-container {
        max-width: 1200px;
        margin: 0 auto;
      }
      .articles-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 2rem;
        text-align: center;
      }
      .articles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
      }
      .no-articles {
        text-align: center;
        padding: 4rem 2rem;
      }
      .no-articles p {
        font-size: 1.125rem;
        color: #6b7280;
      }
      @media (max-width: 768px) {
        .articles-title { font-size: 2rem; }
        .articles-grid { grid-template-columns: 1fr; }
      }
      `}</style>

      <div className="articles-page">
        <div className="articles-container">
          <h1 className="articles-title">All {readableType}</h1>

          {articles && articles.length > 0 ? (
            <>
              <div className="articles-grid">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} showAuthor={true} showReadButton={true}/>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={`/articles/type/${type}`}
                />
              )}
            </>
          ) : (
            <div className="no-articles">
              <p>No articles found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}