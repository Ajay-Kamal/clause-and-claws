import React from "react";
import Link from "next/link";
import styles from "./AboutUs.module.css";
import { supabase } from "@/utils/supabase/client";
import AboutUsClient from "./AboutUsClient";

type Stats = { articles: number; authors: number };

async function getCounts(): Promise<Stats> {
  const [{ count: articlesCount }, { count: authorsCount }] = await Promise.all(
    [
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("published", true),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("username", "is", null),
    ]
  );
  return {
    articles: articlesCount ?? 0,
    authors: authorsCount ?? 0,
  };
}

export default async function AboutUsPage() {
  const stats = await getCounts();
  return (
    <>
      <AboutUsClient stats={stats} />
    </>
  );
}
