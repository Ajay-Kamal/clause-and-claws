// app/authors/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AuthorCard from "@/components/AuthorCard";
import Pagination from "@/components/Pagination";

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

  // Calculate offset for pagination
  const from = (currentPage - 1) * AUTHORS_PER_PAGE;
  const to = from + AUTHORS_PER_PAGE - 1;

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

  // Get total count of authors
  const totalAuthors = authorIds.length;
  const totalPages = Math.ceil(totalAuthors / AUTHORS_PER_PAGE);

  // If page number is invalid, redirect to 404
  if (currentPage < 1 || (totalPages > 0 && currentPage > totalPages)) {
    notFound();
  }

  // Get paginated author IDs
  const paginatedAuthorIds = authorIds.slice(from, to + 1);

  // Fetch author profiles with pagination
  const { data: authors, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", paginatedAuthorIds)
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
    <>
      <style>{`
      .authors-page {
        width: 100%;
        min-height: 100vh;
        padding: 2rem 1rem;
        background: rgb(246 246 246);
      }

      .authors-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .authors-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .authors-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.5rem;
      }

      .authors-subtitle {
        font-size: 1.125rem;
        color: #6b7280;
        max-width: 600px;
        margin: 0 auto;
      }

      .authors-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1.5rem;
        padding: 1rem;
      }

      .stat-item {
        text-align: center;
      }

      .stat-value {
        font-size: 1.875rem;
        font-weight: 700;
        color: #3b82f6;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
        margin-top: 0.25rem;
      }

      .authors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
      }

      .no-authors {
        text-align: center;
        padding: 4rem 2rem;
      }

      .no-authors p {
        font-size: 1.125rem;
        color: #6b7280;
      }

      @media (max-width: 768px) {
        .authors-page {
          padding: 1.5rem 1rem;
        }

        .authors-header {
          margin-bottom: 2rem;
        }

        .authors-title {
          font-size: 2rem;
        }

        .authors-subtitle {
          font-size: 1rem;
        }

        .authors-stats {
          gap: 1.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
        }

        .authors-grid {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
      }

      @media (max-width: 480px) {
        .authors-title {
          font-size: 1.75rem;
        }

        .authors-stats {
          flex-direction: column;
          gap: 1rem;
        }

        .authors-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
      }
      `}</style>
      <div className="authors-page">
        <div className="authors-container">
          {/* Header Section */}
          <div className="authors-header">
            <h1 className="authors-title">Our Authors</h1>
            <p className="authors-subtitle">
              Discover talented writers and thought leaders sharing their expertise
            </p>
            
            {totalAuthors > 0 && (
              <div className="authors-stats">
                <div className="stat-item">
                  <div className="stat-value">{totalAuthors}</div>
                  <div className="stat-label">Authors</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {Object.values(authorStats).reduce(
                      (sum: number, stats: any) => sum + stats.articleCount,
                      0
                    )}
                  </div>
                  <div className="stat-label">Articles</div>
                </div>
              </div>
            )}
          </div>

          {/* Authors Grid */}
          {authorsWithStats && authorsWithStats.length > 0 ? (
            <>
              <div className="authors-grid">
                {authorsWithStats.map((author) => (
                  <AuthorCard key={author.id} author={author} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/authors"
                />
              )}
            </>
          ) : (
            <div className="no-authors">
              <p>No authors found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}