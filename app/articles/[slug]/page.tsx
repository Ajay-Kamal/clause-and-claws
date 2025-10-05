import { getArticleBySlug } from "@/lib/getArticleBySlug";
import ArticleClient from "./ArticleClient";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string | Promise<string>;
  };
}

export default async function ArticlePage({ params }: Props) {
  const awaitedParams = await params;
  const slug =
    typeof awaitedParams.slug === "string"
      ? awaitedParams.slug
      : await awaitedParams.slug;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return notFound();
  }

  return (
    <>
      <ArticleClient article={article} />
    </>
  );
}
