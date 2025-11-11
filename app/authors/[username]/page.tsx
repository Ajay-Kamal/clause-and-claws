// app/authors/[username]/page.tsx - REPLACE ENTIRE FILE
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import styles from "../../../styles/AuthorProfile.module.css";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import ArticleCard from "@/components/ArticleCard";
import { Article } from "@/types";

interface AuthorProfileProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function AuthorProfile({
  params,
}: AuthorProfileProps) {
  const { username } = await params;

  const cookieStore = await cookies(); 

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
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
        <div className={styles.notFoundWrapper}>
          <div className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>Profile Not Found</h1>
            <p className={styles.notFoundMessage}>
              The author profile you&apos;re looking for doesn&apos;t exist or
              has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Fetch authored articles (where user is main author)
  const { data: authoredArticles = [] } = await supabase
    .from("articles")
    .select("*, profiles(username, id, full_name)")
    .eq("author_id", profile.id)
    .eq("published", true)
    .order("created_at", { ascending: false });

  // ✅ Fetch co-authored articles (where user is accepted co-author)
  const { data: coauthoredData = [] } = await supabase
    .from("article_coauthors")
    .select(`
      article:articles(
        *,
        profiles:profiles!author_id(username, id, full_name)
      )
    `)
    .eq("coauthor_id", profile.id)
    .eq("accepted", true);

  // Extract articles from co-authored data
    const coauthoredArticles = (coauthoredData ?? [])
      .map((item: any) => item.article)
      .filter((article: any) => article && article.published)
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

  // Aggregate stats (combine both authored and co-authored)
  const allArticles = [...(authoredArticles as Article[]), ...coauthoredArticles];
  const totalViews = allArticles.reduce(
    (sum, article) => sum + (article.views || 0),
    0
  );
  const totalLikes = allArticles.reduce(
    (sum, article) => sum + (article.likes || 0),
    0
  );
  const totalArticles = (authoredArticles as Article[]).length;
  const totalCoauthored = coauthoredArticles.length;
  const impactScore = 9.1; // Placeholder or computed value

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.profileCard}>
            <div className={styles.profileLeft}>
              <div className={styles.avatarWrapper}>
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.full_name ?? "Author"}'s avatar`}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.defaultAvatar}>
                    <span>
                      {profile.full_name?.charAt(0) ||
                        username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.profileRight}>
              <div className={styles.profileHeader}>
                <div className={styles.profileInfo}>
                  <h1 className={styles.authorName}>{profile.full_name}</h1>
                  <p className={styles.profession}>{profile.profession}</p>
                  <p className={styles.institution}>{profile.location}</p>

                  {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                </div>

                <div className={styles.profileActions}>
                  <FollowButton profileId={profile.id} />
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{totalArticles}</div>
                  <div className={styles.statLabel}>Articles</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{totalCoauthored}</div>
                  <div className={styles.statLabel}>Co-Authored</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{totalViews}</div>
                  <div className={styles.statLabel}>Views</div>
                </div>
                <div className={styles.statItem}>
                  <FollowerCount profileId={profile.id} />
                  <div className={styles.statLabel}>Followers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.publicationsSection}>
        <div className={styles.publicationsContent}>
          {/* ✅ Authored Articles Section */}
          <div className={styles.articleSection}>
            <h2 className={styles.sectionTitle}>
              Authored Articles ({totalArticles})
            </h2>
            {authoredArticles?.length === 0 ? (
              <p className={styles.noArticles}>
                This author has not published any articles yet.
              </p>
            ) : (
              <div className={styles.articlesGrid}>
                {(authoredArticles as Article[]).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    showAuthor={false}
                    showReadButton={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ✅ Co-Authored Articles Section */}
          {coauthoredArticles.length > 0 && (
            <div className={styles.articleSection}>
              <h2 className={styles.sectionTitle}>
                Co-Authored Articles ({totalCoauthored})
              </h2>
              <div className={styles.articlesGrid}>
                {coauthoredArticles.map((article: any) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    showAuthor={true}
                    showReadButton={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}