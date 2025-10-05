// app/articles/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";

// Optional: Add metadata for SEO
export const metadata = {
  title: "All Articles",
  description: "Browse all published articles",
};

const ARTICLES_PER_PAGE = 12;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
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

  // Calculate offset for pagination
  const from = (currentPage - 1) * ARTICLES_PER_PAGE;
  const to = from + ARTICLES_PER_PAGE - 1;

  // Fetch articles with pagination
  const {
    data: articles,
    error,
    count,
  } = await supabase
    .from("articles")
    .select(
      `*,
      profiles (
        full_name,
        username,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .eq("published", true)
    .eq("approved", true)
    .eq("payment_done", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching articles:", error);
    notFound();
  }

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / ARTICLES_PER_PAGE) : 0;

  // If page number is invalid, redirect to 404
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
        .articles-page {
          padding: 1.5rem 1rem;
        }

        .articles-title {
          font-size: 2rem;
          margin-bottom: 1.5rem;
        }

        .articles-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
          justify-items: center;
        }
      }

      @media (max-width: 480px) {
        .articles-title {
          font-size: 1.75rem;
        }

        .articles-grid {
          gap: 1rem;
          grid-template-columns: 1fr;
          justify-items: center;
        }
      }
      `}</style>
      <div className="articles-page">
        <div className="articles-container">
          <h1 className="articles-title">All Articles</h1>

          {articles && articles.length > 0 ? (
            <>
              <div className="articles-grid">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/articles"
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
