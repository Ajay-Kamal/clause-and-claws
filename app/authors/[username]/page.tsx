import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import styles from "../../../styles/AuthorProfile.module.css";

interface Article {
  id?: string;
  slug?: string;
  title: string;
  abstract?: string;
  tags?: string[] | null;
  views?: number;
  likes?: number;
  file_url?: string;
  created_at: string;
  thumbnail_url: string;
  profiles?: {
    id?: string | null;
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  } | null;
}

export default async function AuthorProfile({
  params,
}: {
  params: { username: string | Promise<string> };
}) {
  const awaitedParams = await params;
  const username =
    typeof awaitedParams.username === "string"
      ? awaitedParams.username
      : await awaitedParams.username;

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.profileWrapper}>
          <div className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>Profile Not Found</h1>
            <p className={styles.notFoundMessage}>
              The author profile you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: articles = [] } = await supabase
    .from("articles")
    .select("*, profiles(username, id, full_name)")
    .eq("author_id", profile.id)
    .eq("published", true)
    .order("created_at", { ascending: false });

  // Calculate aggregate stats
  const totalViews = (articles as Article[]).reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = (articles as Article[]).reduce((sum, article) => sum + (article.likes || 0), 0);
  const totalArticles = (articles as Article[]).length;
  const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        {/* Profile Header Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${profile.full_name ?? "Author"}'s avatar`}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  <span>
                    {profile.full_name?.charAt(0) || username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.profileDetails}>
              <h1 className={styles.authorName}>
                {profile.full_name ?? "Unknown Author"}
              </h1>

              <p className={styles.username}>@{profile.username ?? "unknown"}</p>

              {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

              <div className={styles.profileMeta}>
                {profile.profession && (
                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{profile.profession}</span>
                  </div>
                )}
                {profile.location && (
                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.link && (
                  <a href={profile.link} target="_blank" rel="noopener noreferrer" className={styles.metaItem}>
                    <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalArticles}</div>
              <div className={styles.statLabel}>Articles Published</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalViews.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Views</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalLikes.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Likes</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{avgViewsPerArticle.toLocaleString()}</div>
              <div className={styles.statLabel}>Avg. Views/Article</div>
            </div>
          </div>
        </div>



        {/* Articles Section */}
        <div className={styles.articlesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <svg className={styles.titleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Published Articles
            </h2>
            <div className={styles.articleCount}>{totalArticles} {totalArticles === 1 ? 'article' : 'articles'}</div>
          </div>

          <div className={styles.articlesGrid}>
            {(articles as Article[]).length > 0 ? (
              (articles as Article[]).map((article) => (
                // Replace this with your ArticleCard component
                // <ArticleCard key={article.id} article={article} />
                <div key={article.id} className={styles.articleCard}>
                  {article.thumbnail_url && (
                    <div className={styles.articleThumbnail}>
                      <Link href={`/articles/${article.slug}`}>
                        <img 
                          src={article.thumbnail_url} 
                          alt={article.title}
                          className={styles.thumbnailImage}
                        />
                      </Link>
                    </div>
                  )}
                  
                  <div className={styles.articleContent}>
                    <h3 className={styles.articleTitle}>
                      <Link
                        href={`/articles/${article.slug}`}
                        className={styles.articleTitleLink}
                      >
                        {article.title}
                      </Link>
                    </h3>

                    <div className={styles.articleMeta}>
                      <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(article.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>

                    {article.abstract && (
                      <p className={styles.articleAbstract}>{article.abstract}</p>
                    )}

                    {Array.isArray(article.tags) && article.tags.length > 0 && (
                      <div className={styles.tagsContainer}>
                        {article.tags.map((tag) => (
                          <Link key={tag} href={`/tags/${tag}`} className={styles.tag}>
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className={styles.articleStats}>
                      <div className={styles.statItem}>
                        <svg className={styles.statItemIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className={styles.statValue}>
                          {article.views?.toLocaleString() ?? 0}
                        </span>
                        <span className={styles.statText}>views</span>
                      </div>

                      <div className={styles.statItem}>
                        <svg className={styles.statItemIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className={styles.statValue}>
                          {article.likes?.toLocaleString() ?? 0}
                        </span>
                        <span className={styles.statText}>likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className={styles.emptyStateTitle}>No Articles Yet</h3>
                <p className={styles.emptyStateMessage}>
                  This author hasn't published any articles yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}