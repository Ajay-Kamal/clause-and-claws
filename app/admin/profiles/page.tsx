"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import styles from "../../../styles/ProfilesManagement.module.css";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  is_editor: boolean;
  editor_role?: string;
  institution?: string;
  editor_order?: number;
  created_at: string;
}

export default function ProfilesManagementPage() {
  const supabase = createSupabaseBrowserClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editorData, setEditorData] = useState({
    editor_role: "",
    institution: "",
    editor_order: "999", // Changed to string to avoid NaN
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = profiles.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(query) ||
          p.username?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query)
      );
      setFilteredProfiles(filtered);
    }
  }, [searchQuery, profiles]);

  async function fetchProfiles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      alert("Failed to fetch profiles");
    } else {
      setProfiles(data || []);
      setFilteredProfiles(data || []);
    }
    setLoading(false);
  }

  async function toggleEditor(profileId: string, currentStatus: boolean) {
    if (!currentStatus && editingProfile !== profileId) {
      // If turning editor ON, show the form
      setEditingProfile(profileId);
      return;
    }

    // Validation for making editor
    if (!currentStatus) {
      if (!editorData.editor_role) {
        alert("Please select an editor role");
        return;
      }
      if (!editorData.institution) {
        alert("Please enter an institution");
        return;
      }
    }

    try {
      const payload = currentStatus
        ? { is_editor: false }
        : {
            is_editor: true,
            editor_role: editorData.editor_role,
            institution: editorData.institution,
            editor_order: parseInt(editorData.editor_order) || 999,
          };

      console.log("Sending payload:", payload); // Debug log

      const response = await fetch(`/api/admin/profiles/${profileId}/toggle-editor`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("API Response:", result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || "Failed to update editor status");
      }

      // Update the local state immediately
      setProfiles(prevProfiles => 
        prevProfiles.map(p => 
          p.id === profileId 
            ? { ...p, ...result.data }
            : p
        )
      );
      
      // Reset form
      setEditingProfile(null);
      setEditorData({ 
        editor_role: "", 
        institution: "", 
        editor_order: "999" 
      });
      
      alert(currentStatus ? "Editor status removed" : "Editor status granted successfully!");
    } catch (err) {
      console.error("Toggle editor error:", err);
      alert("Failed to update editor status: " + (err as any)?.message);
    }
  }

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Profiles Management</h1>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <p className={styles.emptyState}>
          {searchQuery ? "No profiles found matching your search." : "No profiles available."}
        </p>
      ) : (
        <div className={styles.profilesList}>
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {getInitials(profile.full_name)}
                    </div>
                  )}
                </div>
                <div className={styles.profileInfo}>
                  <h3 className={styles.profileName}>{profile.full_name}</h3>
                  <p className={styles.profileUsername}>@{profile.username}</p>
                  <p className={styles.profileEmail}>{profile.email}</p>
                </div>
                <div className={styles.editorBadge}>
                  {profile.is_editor && (
                    <span className={styles.badge}>✓ Editor</span>
                  )}
                </div>
              </div>

              {profile.is_editor && (
                <div className={styles.editorDetails}>
                  <p><strong>Role:</strong> {profile.editor_role || "Not specified"}</p>
                  <p><strong>Institution:</strong> {profile.institution || "Not specified"}</p>
                  <p><strong>Order:</strong> {profile.editor_order || 999}</p>
                </div>
              )}

              {editingProfile === profile.id && !profile.is_editor && (
                <div className={styles.editorForm}>
                  <h4>Editor Details</h4>
                  <div className={styles.formGroup}>
                    <label>Editor Role *</label>
                    <select
                      value={editorData.editor_role}
                      onChange={(e) =>
                        setEditorData({ ...editorData, editor_role: e.target.value })
                      }
                      className={styles.input}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Senior Editor">Senior Editor</option>
                      <option value="Associate Editor">Associate Editor</option>
                      <option value="Review Board Member">Review Board Member</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Institution *</label>
                    <input
                      type="text"
                      value={editorData.institution}
                      onChange={(e) =>
                        setEditorData({ ...editorData, institution: e.target.value })
                      }
                      placeholder="e.g., University of Law, London"
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={editorData.editor_order}
                      onChange={(e) =>
                        setEditorData({ 
                          ...editorData, 
                          editor_order: e.target.value 
                        })
                      }
                      className={styles.input}
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                {editingProfile === profile.id && !profile.is_editor && (
                  <>
                    <button
                      onClick={() => toggleEditor(profile.id, false)}
                      className={`${styles.button} ${styles.buttonSuccess}`}
                    >
                      Save & Make Editor
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(null);
                        setEditorData({ 
                          editor_role: "", 
                          institution: "", 
                          editor_order: "999" 
                        });
                      }}
                      className={`${styles.button} ${styles.buttonSecondary}`}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {editingProfile !== profile.id && (
                  <button
                    onClick={() => toggleEditor(profile.id, profile.is_editor)}
                    className={`${styles.button} ${
                      profile.is_editor ? styles.buttonDanger : styles.buttonPrimary
                    }`}
                  >
                    {profile.is_editor ? "Remove Editor" : "Make Editor"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}