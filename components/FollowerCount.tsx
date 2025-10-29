"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  profileId: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FollowerCount({ profileId }: Props) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      const { count, error } = await supabase
        .from("follows") // ✅ Changed from "followers" to "follows"
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileId);

      if (error) {
        console.error("Error fetching follower count:", error);
        setLoading(false);
        return;
      }

      if (count !== null) {
        setCount(count);
      }
      setLoading(false);
    };

    fetchFollowers();

    // ✅ Real-time subscription
    const channel = supabase
      .channel(`realtime-followers-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows", // ✅ Changed from "followers" to "follows"
          filter: `following_id=eq.${profileId}`,
        },
        () => {
          fetchFollowers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  if (loading) {
    return <div className="text-lg font-semibold">0</div>;
  }

  return <div className="text-lg font-semibold">{count}</div>;
}