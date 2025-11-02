"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import styles from "@/styles/ArticlesPage.module.css";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ResearchPapersPage: React.FC = () => {
  const [featuredResearchPapers, setFeaturedResearchPapers] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [featuredLegislative, setFeaturedLegislative] = useState<any[]>([]);
  const [allResearchPapers, setAllResearchPapers] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [allLegislative, setAllLegislative] = useState<any[]>([]);
  const [allCaseNotes, setAllCaseNotes] = useState<any[]>([]);
  const [bookReviews, setBookReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: featuredRP } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Research Paper")
        .eq("is_featured", true)
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false })
        .limit(4);

      const { data: featuredArt } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Article")
        .eq("is_featured", true)
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false })
        .limit(4);

      const { data: featuredLeg } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Legislative Comments")
        .eq("is_featured", true)
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false })
        .limit(4);

      const { data: allRP } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Research Paper")
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false });

      const { data: allArt } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Article")
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false });

      const { data: allLeg } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Legislative Comments")
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false });

      const { data: allCN } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Case Notes")
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false });

      const { data: reviews } = await supabase
        .from("articles")
        .select("*, profiles(full_name)")
        .eq("type", "Book Reviews")
        .eq("published", true)
        .eq("draft", false)
        .order("created_at", { ascending: false });

      setFeaturedResearchPapers(featuredRP || []);
      setFeaturedArticles(featuredArt || []);
      setFeaturedLegislative(featuredLeg || []);
      setAllResearchPapers(allRP || []);
      setAllArticles(allArt || []);
      setAllLegislative(allLeg || []);
      setAllCaseNotes(allCN || []);
      setBookReviews(reviews || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        researchPapers: allResearchPapers.slice(0, 5),
        articles: allArticles.slice(0, 5),
        legislative: allLegislative.slice(0, 5),
        caseNotes: allCaseNotes.slice(0, 5),
        bookReviews: bookReviews,
      };
    }

    const query = searchQuery.toLowerCase().trim();
    const filterArticles = (articles: any[]) =>
      articles.filter((article) => {
        const title = (article.title || "").toLowerCase();
        const abstract = (article.abstract || "").toLowerCase();
        const authorName = (article.profiles?.full_name || "").toLowerCase();
        return (
          title.includes(query) ||
          abstract.includes(query) ||
          authorName.includes(query)
        );
      });

    return {
      researchPapers: filterArticles(allResearchPapers).slice(0, 5),
      articles: filterArticles(allArticles).slice(0, 5),
      legislative: filterArticles(allLegislative).slice(0, 5),
      caseNotes: filterArticles(allCaseNotes).slice(0, 5),
      bookReviews: filterArticles(bookReviews),
    };
  }, [
    searchQuery,
    allResearchPapers,
    allArticles,
    allLegislative,
    allCaseNotes,
    bookReviews,
  ]);

  // Calculate total results
  const totalResults = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    return (
      filteredData.researchPapers.length +
      filteredData.articles.length +
      filteredData.legislative.length +
      filteredData.caseNotes.length +
      filteredData.bookReviews.length
    );
  }, [filteredData, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const TopLatestSection: React.FC = () => {
    const latestRP = filteredData.researchPapers.slice(0, 4);
    const latestArticle = filteredData.articles[0];
    const latestLC = filteredData.legislative.slice(0, 4);

    // Don't show section if searching and no results
    if (searchQuery && latestRP.length === 0 && !latestArticle && latestLC.length === 0) {
      return null;
    }

    return (
      <section className={styles.topLatestSection}>
        <div className={styles.topLatestGrid}>
          {/* Research Papers Column */}
          <div className={styles.topLatestColumn}>
            <h2 className={styles.topLatestTitle}>Research papers</h2>
            <div className={styles.topLatestList}>
              {latestRP.length > 0 ? (
                latestRP.map((article) => (
                  <a
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className={styles.topLatestItem}
                  >
                    <h3 className={styles.topLatestItemTitle}>{article.title}</h3>
                    <p className={styles.topLatestItemAuthor}>
                      {article.profiles?.full_name || "Anonymous"}
                    </p>
                  </a>
                ))
              ) : (
                <p className={styles.noResults}>No research papers found</p>
              )}
            </div>
          </div>

          {/* Featured Article Center */}
          <div className={styles.topLatestCenter}>
            <h2 className={styles.topLatestTitle}>Articles</h2>
            {latestArticle ? (
              <a
                href={`/articles/${latestArticle.slug}`}
                className={styles.topLatestFeatured}
              >
                <img
                  src={
                    latestArticle.thumbnail_url ||
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400"
                  }
                  alt={latestArticle.title}
                  className={styles.topLatestFeaturedImage}
                />
                <h3 className={styles.topLatestFeaturedTitle}>
                  {latestArticle.title}
                </h3>
                <p className={styles.topLatestFeaturedAuthor}>
                  {latestArticle.profiles?.full_name || "Anonymous"}
                </p>
              </a>
            ) : (
              <p className={styles.noResults}>No articles found</p>
            )}
          </div>

          {/* Legislative Comments Column */}
          <div className={styles.topLatestColumn}>
            <h2 className={styles.topLatestTitle}>Legislative comments</h2>
            <div className={styles.topLatestList}>
              {latestLC.length > 0 ? (
                latestLC.map((article) => (
                  <a
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className={styles.topLatestItem}
                  >
                    <h3 className={styles.topLatestItemTitle}>{article.title}</h3>
                    <p className={styles.topLatestItemAuthor}>
                      {article.profiles?.full_name || "Anonymous"}
                    </p>
                  </a>
                ))
              ) : (
                <p className={styles.noResults}>No legislative comments found</p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const FeaturedSection: React.FC<{
    title: string;
    articles: any[];
    buttonText?: string;
    moreLink?: string;
    backgroundColor?: string;
  }> = ({ title, articles, buttonText = "More...", moreLink = "#", backgroundColor }) => {
    if (!articles || articles.length === 0) return null;

    const mainArticle = articles[0];
    const sideArticles = articles.slice(1, 4);

    return (
      <section className={styles.featuredSection} style={backgroundColor ? { backgroundColor } : undefined}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <a href={moreLink} className={styles.moreBtn}>{buttonText}</a>
        </div>

        <div className={styles.featuredGrid}>
          <a href={`/articles/${mainArticle.slug}`} className={styles.mainCard}>
            <img
              src={
                mainArticle.thumbnail_url ||
                "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400"
              }
              alt={mainArticle.title}
              className={styles.mainImage}
            />
            <div className={styles.mainContent}>
              <div>
                <h3 className={styles.mainTitle}>{mainArticle.title}</h3>
                <p className={styles.mainAbstract}>
                  {mainArticle.abstract?.substring(0, 180)}...
                </p>
              </div>

              <div className={styles.mainFooter}>
                <div className={styles.mainMeta}>
                  <span className={styles.authorName}>
                    {mainArticle.profiles?.full_name || "Anonymous"}
                  </span>
                  <span className={styles.dateText}>
                    {formatDate(mainArticle.created_at)}
                  </span>
                </div>
                <div className={styles.statsBar}>
                  <span className={styles.statItem}>
                    Reads: <strong>{mainArticle.views || 94}</strong>
                  </span>
                  <span className={styles.statItem}>
                    Likes: <strong>{mainArticle.likes || 94}</strong>
                  </span>
                  <span className={styles.statItem}>
                    Impact: <strong>94</strong>
                  </span>
                </div>
              </div>
            </div>
          </a>

          <div className={styles.sideCards}>
            {sideArticles.map((article) => (
              <a
                key={article.id}
                href={`/articles/${article.slug}`}
                className={styles.sideCard}
              >
                <img
                  src={
                    article.thumbnail_url ||
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200"
                  }
                  alt={article.title}
                  className={styles.sideImage}
                />
                <div className={styles.sideContent}>
                  <h4 className={styles.sideTitle}>{article.title}</h4>
                  <div className={styles.sideMeta}>
                    <span className={styles.sideAuthor}>
                      {article.profiles?.full_name || "Anonymous"}
                    </span>
                    <span className={styles.sideDate}>
                      {formatDate(article.created_at)}
                    </span>
                  </div>
                  <div className={styles.sideStats}>
                    <span>
                      Reads: <strong>{article.views || 94}</strong>
                    </span>
                    <span>
                      Likes: <strong>{article.likes || 94}</strong>
                    </span>
                    <span>
                      Impact: <strong>94</strong>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const CategoryGrid: React.FC<{ 
    title: string; 
    articles: any[];
    moreLink?: string;
  }> = ({
    title,
    articles,
    moreLink = "#",
  }) => {
    if (!articles || articles.length === 0) return null;
    return (
      <div className={styles.categoryCol}>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <div className={styles.categoryItems}>
          {articles.map((article) => (
            <a
              key={article.id}
              href={`/articles/${article.slug}`}
              className={styles.categoryLink}
            >
              <h4 className={styles.categoryItemTitle}>{article.title}</h4>
            </a>
          ))}
          {articles.length > 0 && (
            <a href={moreLink} className={styles.moreTextLink}>
              <button className={styles.moreText}>More...</button>
            </a>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.authorsHeader}>
        <h1 className={styles.authorsTitle}>Explore Publications</h1>
        <p className={styles.authorsSubtitle}>
          Browse our comprehensive collection of peer-reviewed legal scholarship
        </p>
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search Article, Research paper, Book Reviews..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button type="submit" aria-label="Search">
              <img src="/images/search-icon.svg" alt="Search" />
            </button>
          </form>
        </div>
      </div>

      <div className={styles.container}>
        {/* Search Results Count */}
        {searchQuery && (
          <div className={styles.searchResults}>
            <p>
              Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Show message if no results */}
        {searchQuery && totalResults === 0 ? (
          <div className={styles.noResultsContainer}>
            <p className={styles.noResultsText}>
              No articles found matching "{searchQuery}". Try a different search term.
            </p>
          </div>
        ) : (
          <>
            {!searchQuery && <TopLatestSection />}

            {!searchQuery && (
              <>
                <FeaturedSection
                  title="Research papers"
                  articles={featuredResearchPapers}
                  moreLink="/type-research-paper"
                  backgroundColor="#F1E7D0"
                />
                <FeaturedSection 
                  title="Articles" 
                  articles={featuredArticles}
                  moreLink="/type-article"
                  backgroundColor="#fef3e2"
                />
                <FeaturedSection
                  title="Legislative Comments"
                  articles={featuredLegislative}
                  moreLink="/type-legislative-comments"
                  backgroundColor="#f0fdf4"
                />
              </>
            )}

            <div className={styles.allCategoriesWrapper}>
              <div className={styles.allCategoriesGrid}>
                <CategoryGrid
                  title="Research papers"
                  articles={filteredData.researchPapers}
                  moreLink="/type-research-paper"
                />
                <CategoryGrid 
                  title="Article" 
                  articles={filteredData.articles}
                  moreLink="/type-article"
                />
                <CategoryGrid
                  title="Legislative Comments"
                  articles={filteredData.legislative}
                  moreLink="/type-legislative-comments"
                />
                <CategoryGrid
                  title="Case Notes"
                  articles={filteredData.caseNotes}
                  moreLink="/type-case-notes"
                />
              </div>
            </div>

            {filteredData.bookReviews.length > 0 && (
              <section className={styles.bookReviewsSection}>
                <h2 className={styles.bookReviewsTitle}>Book Reviews</h2>
                <div className={styles.bookReviewsScroll}>
                  {filteredData.bookReviews.map((review) => (
                    <a
                      key={review.id}
                      href={`/articles/${review.slug}`}
                      className={styles.reviewCard}
                    >
                      <h4 className={styles.reviewTitle}>{review.title}</h4>
                      <p className={styles.reviewAbstract}>
                        {review.abstract?.substring(0, 120)}...
                      </p>
                      <div className={styles.reviewAuthor}>
                        {review.profiles?.full_name || "Anonymous"}
                      </div>
                    </a>
                  ))}
                  {filteredData.bookReviews.length > 4 && (
                    <div className={styles.moreReviewsCard}>
                      <a href="/type-book-reviews">
                        <button className={styles.moreReviewsBtn}>More...</button>
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResearchPapersPage;