"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ManageDiscussions() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    const { data } = await supabase
      .from("discussions")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    setDiscussions(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this discussion? This will also delete all related comments and likes.")) {
      await supabase.from("discussions").delete().eq("id", id);
      fetchDiscussions();
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", fontFamily: "garamond" }}>
        Manage Discussions
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Title</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Author</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>Likes</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>
                Comments
              </th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>Date</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discussions.map((discussion) => (
              <tr key={discussion.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: "1rem", maxWidth: "300px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    {discussion.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {discussion.description}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>{discussion.profiles?.full_name || "Anonymous"}</td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  {discussion.likes_count}
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  {discussion.comments_count}
                </td>
                <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
                  {new Date(discussion.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  <button
                    onClick={() => handleDelete(discussion.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {discussions.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            No discussions found
          </div>
        )}
      </div>
    </div>
  );
};