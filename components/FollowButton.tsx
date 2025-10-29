"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import GoogleModal from "./GoogleModal";
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
  const [showModal, setShowModal] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        // Don't let users follow themselves
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
      .from("follows") // ✅ Changed from "followers" to "follows"
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
      setShowModal(true);
      return;
    }

    // Prevent following yourself
    if (userId === profileId) {
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows") // ✅ Changed from "followers" to "follows"
          .delete()
          .eq("follower_id", userId)
          .eq("following_id", profileId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: userId,
          following_id: profileId,
        });

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Google sign-in error:", error);
    setSigningIn(false);
  };

  // Don't show follow button if viewing your own profile
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
    <>
      <button
        onClick={toggleFollow}
        disabled={loading}
        className={`${styles.followBtn} ${
          isFollowing ? styles.following : styles.notFollowing
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>

      <GoogleModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSignIn={handleSignIn}
        isLoading={signingIn}
        redirectPath={window.location.pathname}
      />
    </>
  );
}