"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import styles from "@/styles/ArticlesPage.module.css";
import ArticleCard from "@/components/ArticleCard";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ResearchPapersPage: React.FC = () => {
  const [featuredResearchPapers, setFeaturedResearchPapers] = useState<any[]>(
    []
  );
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
      researchPapers: filterArticles(allResearchPapers),
      articles: filterArticles(allArticles),
      legislative: filterArticles(allLegislative),
      caseNotes: filterArticles(allCaseNotes),
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

  // Combine all search results into a single array
  const allSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return [
      ...filteredData.researchPapers,
      ...filteredData.articles,
      ...filteredData.legislative,
      ...filteredData.caseNotes,
      ...filteredData.bookReviews,
    ];
  }, [filteredData, searchQuery]);

  const totalResults = allSearchResults.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    setSearchQuery("");
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

    if (
      searchQuery &&
      latestRP.length === 0 &&
      !latestArticle &&
      latestLC.length === 0
    ) {
      return null;
    }

    return (
      <section className={styles.topLatestSection}>
        <div className={styles.topLatestGrid}>
          <div className={styles.topLatestColumnRP}>
            <h2 className={styles.topLatestTitle}>Research papers</h2>
            <div className={styles.topLatestList}>
              {latestRP.length > 0 ? (
                latestRP.map((article) => (
                  <a
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className={styles.topLatestItem}
                  >
                    <h3 className={styles.topLatestItemTitle}>
                      {article.title}
                    </h3>
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

          <div className={styles.topLatestCenter}>
            <h2 className={styles.topLatestTitleAt}>Article</h2>
            {latestArticle ? (
              <a
                href={`/articles/${latestArticle.slug}`}
                className={styles.topLatestFeatured}
              >
                <h3 className={styles.topLatestFeaturedTitle}>
                  {latestArticle.title}
                </h3>
                <p className={styles.topLatestFeaturedAuthor}>
                  {latestArticle.profiles?.full_name || "Anonymous"}
                </p>
                <img
                  src={
                    latestArticle.thumbnail_url ||
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400"
                  }
                  alt={latestArticle.title}
                  className={styles.topLatestFeaturedImage}
                />
              </a>
            ) : (
              <p className={styles.noResults}>No articles found</p>
            )}
          </div>

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
                    <h3 className={styles.topLatestItemTitle}>
                      {article.title}
                    </h3>
                    <p className={styles.topLatestItemAuthor}>
                      {article.profiles?.full_name || "Anonymous"}
                    </p>
                  </a>
                ))
              ) : (
                <p className={styles.noResults}>
                  No legislative comments found
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const FeaturedStandardSection: React.FC<{
    title: string;
    articles: any[];
    moreLink?: string;
  }> = ({ title, articles, moreLink = "#" }) => {
    if (!articles || articles.length === 0) return null;

    const mainArticle = articles[0];
    const sideArticles = articles.slice(1, 4);

    return (
      <section className={styles.featuredStandardSection}>
        <div className={styles.featuredStandardSectionWrapper}>
          <div className={styles.featuredStandardHeader}>
            <h2 className={styles.featuredStandardTitle}>{title}</h2>
            <a href={moreLink} className={styles.featuredStandardMoreBtn}>
              More...
            </a>
          </div>

          <div className={styles.featuredStandardGrid}>
            <a
              href={`/articles/${mainArticle.slug}`}
              className={styles.featuredStandardMainCard}
            >
              <img
                src={
                  mainArticle.thumbnail_url ||
                  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400"
                }
                alt={mainArticle.title}
                className={styles.featuredStandardMainImage}
              />
              <div className={styles.featuredStandardMainContent}>
                <div>
                  <h3 className={styles.featuredStandardMainTitle}>
                    {mainArticle.title}
                  </h3>
                  <p className={styles.featuredStandardMainAbstract}>
                    {mainArticle.abstract?.substring(0, 180)}...
                  </p>
                </div>

                <div className={styles.featuredStandardMainFooter}>
                  <div className={styles.featuredStandardMainMeta}>
                    <span className={styles.featuredStandardAuthorName}>
                      {mainArticle.profiles?.full_name || "Anonymous"}
                    </span>
                    <span className={styles.featuredStandardDateText}>
                      {formatDate(mainArticle.created_at)}
                    </span>
                  </div>
                  <div className={styles.featuredStandardStatsBar}>
                    <span className={styles.featuredStandardStatItem}>
                      Reads: <strong>{mainArticle.views || 94}</strong>
                    </span>
                    <span className={styles.featuredStandardStatItem}>
                      Likes: <strong>{mainArticle.likes || 94}</strong>
                    </span>
                    <span className={styles.featuredStandardStatItem}>
                      Impact: <strong>94</strong>
                    </span>
                  </div>
                </div>
              </div>
            </a>

            <div className={styles.featuredStandardSideCards}>
              {sideArticles.map((article) => (
                <a
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className={styles.featuredStandardSideCard}
                >
                  <img
                    src={
                      article.thumbnail_url ||
                      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200"
                    }
                    alt={article.title}
                    className={styles.featuredStandardSideImage}
                  />
                  <div className={styles.featuredStandardSideContent}>
                    <h4 className={styles.featuredStandardSideTitle}>
                      {article.title}
                    </h4>
                    <div className={styles.featuredStandardSideMeta}>
                      <span className={styles.featuredStandardSideAuthor}>
                        {article.profiles?.full_name || "Anonymous"}
                      </span>
                      <span className={styles.featuredStandardSideDate}>
                        {formatDate(article.created_at)}
                      </span>
                    </div>
                    <div className={styles.featuredStandardSideStats}>
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
        </div>
      </section>
    );
  };

  const FeaturedArticlesSection: React.FC<{
    articles: any[];
    moreLink?: string;
  }> = ({ articles, moreLink = "#" }) => {
    if (!articles || articles.length === 0) return null;

    const mainArticle = articles[0];
    const sideArticles = articles.slice(1, 4);

    return (
      <section className={styles.featuredArticlesSection}>
        <div className={styles.featuredArticlesSectionWrapper}>
          <div className={styles.featuredArticlesHeader}>
            <h2 className={styles.featuredArticlesTitle}>Articles</h2>
            <a href={moreLink} className={styles.featuredArticlesMoreBtn}>
              More...
            </a>
          </div>

          <div className={styles.featuredArticlesGrid}>
            <a
              href={`/articles/${mainArticle.slug}`}
              className={styles.featuredArticlesMainCard}
            >
              <img
                src={
                  mainArticle.thumbnail_url ||
                  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400"
                }
                alt={mainArticle.title}
                className={styles.featuredArticlesMainImage}
              />
              <div className={styles.featuredArticlesMainContent}>
                <div>
                  <h3 className={styles.featuredArticlesMainTitle}>
                    {mainArticle.title}
                  </h3>
                  <p className={styles.featuredArticlesMainAbstract}>
                    {mainArticle.abstract?.substring(0, 180)}...
                  </p>
                </div>

                <div className={styles.featuredArticlesMainFooter}>
                  <div className={styles.featuredArticlesMainMeta}>
                    <span className={styles.featuredArticlesAuthorName}>
                      {mainArticle.profiles?.full_name || "Anonymous"}
                    </span>
                    <span className={styles.featuredArticlesDateText}>
                      {formatDate(mainArticle.created_at)}
                    </span>
                  </div>
                  <div className={styles.featuredArticlesStatsBar}>
                    <span className={styles.featuredArticlesStatItem}>
                      Reads: <strong>{mainArticle.views || 94}</strong>
                    </span>
                    <span className={styles.featuredArticlesStatItem}>
                      Likes: <strong>{mainArticle.likes || 94}</strong>
                    </span>
                    <span className={styles.featuredArticlesStatItem}>
                      Impact: <strong>94</strong>
                    </span>
                  </div>
                </div>
              </div>
            </a>

            <div className={styles.featuredArticlesSideCards}>
              {sideArticles.map((article) => (
                <a
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className={styles.featuredArticlesSideCard}
                >
                  <img
                    src={
                      article.thumbnail_url ||
                      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200"
                    }
                    alt={article.title}
                    className={styles.featuredArticlesSideImage}
                  />
                  <div className={styles.featuredArticlesSideContent}>
                    <h4 className={styles.featuredArticlesSideTitle}>
                      {article.title}
                    </h4>
                    <div className={styles.featuredArticlesSideMeta}>
                      <span className={styles.featuredArticlesSideAuthor}>
                        {article.profiles?.full_name || "Anonymous"}
                      </span>
                      <span className={styles.featuredArticlesSideDate}>
                        {formatDate(article.created_at)}
                      </span>
                    </div>
                    <div className={styles.featuredArticlesSideStats}>
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
        </div>
      </section>
    );
  };

  const CategoryGrid: React.FC<{
    title: string;
    articles: any[];
    moreLink?: string;
    rightBorder : boolean;
  }> = ({ title, articles, moreLink = "#" , rightBorder = true}) => {
    if (!articles || articles.length === 0) return null;
    return (
      <div
        className={styles.categoryCol}
        style={
          rightBorder
            ? { borderRight: "1px solid rgba(237, 228, 194, 1)" }
            : {}
        }
      >
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

      {/* Search Results Overlay */}
      {searchQuery && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchOverlayContent}>
            <div className={styles.searchOverlayHeader}>
              <h2 className={styles.searchOverlayTitle}>
                Search Results for "{searchQuery}"
              </h2>
              <button 
                onClick={clearSearch} 
                className={styles.closeSearchBtn}
                aria-label="Close search"
              >
                ✕
              </button>
            </div>

            <p className={styles.searchResultsCount}>
              Found {totalResults} result{totalResults !== 1 ? "s" : ""}
            </p>

            {totalResults === 0 ? (
              <div className={styles.noResultsContainer}>
                <p className={styles.noResultsText}>
                  No articles found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              <div className={styles.searchResultsGrid}>
                {allSearchResults.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    showAuthor={true}
                    showReadButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.container}>
        {!searchQuery && (
          <>
            <TopLatestSection />

            {/* Research Papers - Standard Style */}
            <FeaturedStandardSection
              title="Research papers"
              articles={featuredResearchPapers}
              moreLink="/articles/type/research-paper"
            />

            {/* Articles - Same Layout, Different Colors */}
            <FeaturedArticlesSection
              articles={featuredArticles}
              moreLink="/articles/type/article"
            />

            {/* Legislative Comments - Standard Style */}
            <FeaturedStandardSection
              title="Legislative Comments"
              articles={featuredLegislative}
              moreLink="/articles/type/legislative-comments"
            />

            <div className={styles.allCategoriesWrapper}>
              <div className={styles.allCategoriesGrid}>
                <CategoryGrid
                  title="Research papers"
                  articles={filteredData.researchPapers}
                  moreLink="/articles/type/research-paper"
                  rightBorder={true}
                />
                <CategoryGrid
                  title="Article"
                  articles={filteredData.articles}
                  moreLink="/articles/type/article"
                  rightBorder={true}
                />
                <CategoryGrid
                  title="Legislative Comments"
                  articles={filteredData.legislative}
                  moreLink="/articles/type/legislative-comments"
                  rightBorder={true}
                />
                <CategoryGrid
                  title="Case Notes"
                  articles={filteredData.caseNotes}
                  moreLink="/articles/type/case-notes"
                  rightBorder={false}
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
                    </a>
                  ))}
                  {filteredData.bookReviews.length > 4 && (
                    <div className={styles.moreReviewsCard}>
                      <a href="/articles/type/book-reviews">
                        <button className={styles.moreReviewsBtn}>
                          More...
                        </button>
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