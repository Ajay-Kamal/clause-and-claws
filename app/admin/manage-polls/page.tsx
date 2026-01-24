"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  expiry_date: string;
  created_at: string;
  status: string;
  created_by: string;
  total_votes: number;
  profiles: {
    full_name: string;
    email: string;
  };
}

type ViewMode = "pending" | "live";

export default function ManagePolls() {
  const [pendingPolls, setPendingPolls] = useState<Poll[]>([]);
  const [livePolls, setLivePolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("pending");

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingPolls();
      fetchLivePolls();
    }
  }, [isAdmin]);

  const checkAdmin = async () => {
    console.log("Checking admin status...");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      setLoading(false);
      return;
    }
    
    if (user) {
      console.log("User found:", user.id);
      setUser(user);
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        console.log("Profile data:", profile);
        console.log("Is admin:", profile?.is_admin);
      }
      
      if (profile?.is_admin) {
        setIsAdmin(true);
      }
    } else {
      console.log("No user logged in");
    }
    setLoading(false);
  };

  const fetchPendingPolls = async () => {
    console.log("Fetching pending polls...");
    
    const { data, error } = await supabase
      .from("polls")
      .select(`
        *,
        profiles!polls_created_by_fkey(full_name, email)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching pending polls:", error);
      alert(`Error loading polls: ${error.message}`);
    } else {
      console.log("Fetched pending polls:", data);
      console.log("Number of pending polls:", data?.length || 0);
    }
    
    setPendingPolls(data || []);
  };

  const fetchLivePolls = async () => {
    console.log("Fetching live polls...");
    
    const { data, error } = await supabase
      .from("polls")
      .select(`
        *,
        profiles!polls_created_by_fkey(full_name, email)
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching live polls:", error);
    } else {
      console.log("Fetched live polls:", data);
    }
    
    setLivePolls(data || []);
  };

  const handleApprovePoll = async (pollId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("polls")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", pollId);

    if (error) {
      console.error("Error approving poll:", error);
      alert("Failed to approve poll");
    } else {
      alert("Poll approved successfully!");
      fetchPendingPolls();
      fetchLivePolls();
    }
  };

  const handleRejectPoll = async (pollId: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to reject this poll? This action cannot be undone.")) {
      const { error } = await supabase
        .from("polls")
        .update({
          status: "rejected",
        })
        .eq("id", pollId);

      if (error) {
        console.error("Error rejecting poll:", error);
        alert("Failed to reject poll");
      } else {
        alert("Poll rejected");
        fetchPendingPolls();
      }
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to DELETE this live poll? This will permanently remove it and all associated votes.")) {
      const { error } = await supabase
        .from("polls")
        .delete()
        .eq("id", pollId);

      if (error) {
        console.error("Error deleting poll:", error);
        alert("Failed to delete poll");
      } else {
        alert("Poll deleted successfully");
        fetchLivePolls();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "80vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontFamily: "garamond, serif"
      }}>
        <div style={{ fontSize: "20px", color: "#1a1a1a" }}>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ 
        minHeight: "80vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontFamily: "garamond, serif",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <h2 style={{ fontSize: "2rem", color: "#122645" }}>Access Denied</h2>
        <p style={{ fontSize: "1.125rem", color: "#6b7280" }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const currentPolls = viewMode === "pending" ? pendingPolls : livePolls;

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#fffff0",
      width: "100%"
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        backgroundColor: "#122645",
        padding: "3rem 1rem",
        width: "100%"
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 500,
          color: "#ffffff",
          margin: "0 0 0.5rem 0",
          fontFamily: "garamond, serif"
        }}>
          Manage Polls
        </h1>
        <p style={{
          fontSize: "1.125rem",
          color: "#ffffff",
          margin: "0 0 1.5rem 0",
          fontFamily: "Arial, sans-serif"
        }}>
          {viewMode === "pending" ? "Review and approve pending polls" : "Manage live polls"}
        </p>

        {/* Tab Buttons */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "1rem",
          marginTop: "1.5rem"
        }}>
          <button
            onClick={() => setViewMode("pending")}
            style={{
              backgroundColor: viewMode === "pending" ? "#ffffff" : "transparent",
              color: viewMode === "pending" ? "#122645" : "#ffffff",
              border: "2px solid #ffffff",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "Arial, sans-serif",
              transition: "all 0.3s ease"
            }}
          >
            Pending Polls ({pendingPolls.length})
          </button>
          <button
            onClick={() => setViewMode("live")}
            style={{
              backgroundColor: viewMode === "live" ? "#ffffff" : "transparent",
              color: viewMode === "live" ? "#122645" : "#ffffff",
              border: "2px solid #ffffff",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "Arial, sans-serif",
              transition: "all 0.3s ease"
            }}
          >
            Live Polls ({livePolls.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "3rem 1rem" 
      }}>
        {currentPolls.length === 0 ? (
          <p style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "1.125rem",
            padding: "4rem 2rem",
            fontFamily: "garamond, serif"
          }}>
            {viewMode === "pending" 
              ? "No pending polls to review" 
              : "No live polls currently"}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {currentPolls.map((poll) => (
              <div
                key={poll.id}
                style={{
                  backgroundColor: "#f1e7d0",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem"
                }}>
                  <div style={{ flex: 1 }}>
                    {viewMode === "live" && (
                      <div style={{
                        display: "inline-block",
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        marginBottom: "0.75rem",
                        fontFamily: "Arial, sans-serif"
                      }}>
                        LIVE
                      </div>
                    )}
                    <h2 style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#122645",
                      margin: "0 0 0.5rem 0",
                      fontFamily: "garamond, serif"
                    }}>
                      {poll.question}
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem 0",
                      fontFamily: "Arial, sans-serif"
                    }}>
                      Created by: {poll.profiles?.full_name} ({poll.profiles?.email})
                    </p>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      margin: 0,
                      fontFamily: "Arial, sans-serif"
                    }}>
                      Submitted on: {formatDate(poll.created_at)}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <strong style={{ 
                    fontSize: "0.875rem", 
                    color: "#122645",
                    display: "block",
                    marginBottom: "0.5rem"
                  }}>
                    Poll Options:
                  </strong>
                  <ul style={{
                    margin: 0,
                    paddingLeft: "1.5rem",
                    fontFamily: "Arial, sans-serif"
                  }}>
                    {poll.options.map((option) => (
                      <li key={option.id} style={{
                        fontSize: "0.875rem",
                        color: "#2f4b87",
                        marginBottom: "0.25rem"
                      }}>
                        {option.text}
                        {viewMode === "live" && (
                          <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>
                            ({option.votes} votes)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}>
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "#122645" }}>
                      Expiry Date:
                    </strong>
                    <p style={{ 
                      margin: "0.25rem 0 0 0", 
                      fontSize: "0.875rem", 
                      color: "#6b7280",
                      fontFamily: "Arial, sans-serif"
                    }}>
                      {formatDate(poll.expiry_date)}
                    </p>
                  </div>
                  {viewMode === "live" && (
                    <div>
                      <strong style={{ fontSize: "0.875rem", color: "#122645" }}>
                        Total Votes:
                      </strong>
                      <p style={{ 
                        margin: "0.25rem 0 0 0", 
                        fontSize: "0.875rem", 
                        color: "#6b7280",
                        fontFamily: "Arial, sans-serif"
                      }}>
                        {poll.total_votes} votes
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "1rem" }}>
                  {viewMode === "pending" ? (
                    <>
                      <button
                        onClick={() => handleApprovePoll(poll.id)}
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          fontSize: "1rem",
                          fontWeight: 600,
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: "Arial, sans-serif",
                          flex: 1
                        }}
                      >
                        Approve Poll
                      </button>
                      <button
                        onClick={() => handleRejectPoll(poll.id)}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          fontSize: "1rem",
                          fontWeight: 600,
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: "Arial, sans-serif",
                          flex: 1
                        }}
                      >
                        Reject Poll
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontFamily: "Arial, sans-serif",
                        width: "100%"
                      }}
                    >
                      Delete Poll
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}