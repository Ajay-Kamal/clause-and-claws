"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../styles/FollowButton.module.css";

interface FollowButtonProps {
  profileId: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FollowButton({ profileId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        if (user.id !== profileId) {
          await checkIfFollowing(user.id);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [profileId]);

  const checkIfFollowing = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("following_id", profileId)
      .maybeSingle();

    if (error) {
      console.error("Error checking follow status:", error);
      return;
    }

    if (data) setIsFollowing(true);
  };

  const toggleFollow = async () => {
    if (!userId) {
      alert("Please sign in to follow this author!");
      return;
    }

    if (userId === profileId) {
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", userId)
          .eq("following_id", profileId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: userId,
          following_id: profileId,
        });

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (userId && userId === profileId) {
    return null;
  }

  if (loading) {
    return (
      <button className={styles.followBtnDisabled} disabled>
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`${styles.followBtn} ${
        isFollowing ? styles.following : styles.notFollowing
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}