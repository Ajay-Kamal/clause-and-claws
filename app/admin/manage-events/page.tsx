"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PendingEvent {
  id: string;
  type_of: string;
  title: string;
  description: string;
  link: string;
  expiry_date_for_registration: string;
  event_date: string;
  location: string;
  created_at: string;
  status: string;
  created_by: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ManageEvents() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingEvents();
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

  const fetchPendingEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        profiles!events_created_by_fkey(full_name, email)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching pending events:", error);
    }
    
    console.log("Fetched events:", data); // Debug log
    setPendingEvents(data || []);
    setLoading(false);
  };

  const handleApproveEvent = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("events")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (error) {
      console.error("Error approving event:", error);
      alert("Failed to approve event");
    } else {
      alert("Event approved successfully!");
      fetchPendingEvents();
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to reject this event? This action cannot be undone.")) {
      const { error } = await supabase
        .from("events")
        .update({
          status: "rejected",
        })
        .eq("id", eventId);

      if (error) {
        console.error("Error rejecting event:", error);
        alert("Failed to reject event");
      } else {
        alert("Event rejected");
        fetchPendingEvents();
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
          Manage Events
        </h1>
        <p style={{
          fontSize: "1.125rem",
          color: "#ffffff",
          margin: 0,
          fontFamily: "Arial, sans-serif"
        }}>
          Review and approve pending events
        </p>
      </div>

      {/* Content */}
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "3rem 1rem" 
      }}>
        {pendingEvents.length === 0 ? (
          <p style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "1.125rem",
            padding: "4rem 2rem",
            fontFamily: "garamond, serif"
          }}>
            No pending events to review
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {pendingEvents.map((event) => (
              <div
                key={event.id}
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
                  <div>
                    <div style={{
                      display: "inline-block",
                      backgroundColor: "#122645",
                      color: "white",
                      padding: "0.375rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      marginBottom: "0.75rem",
                      fontFamily: "Arial, sans-serif"
                    }}>
                      {event.type_of}
                    </div>
                    <h2 style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#122645",
                      margin: "0 0 0.5rem 0",
                      fontFamily: "garamond, serif"
                    }}>
                      {event.title}
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem 0",
                      fontFamily: "Arial, sans-serif"
                    }}>
                      Created by: {event.profiles?.full_name} ({event.profiles?.email})
                    </p>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      margin: 0,
                      fontFamily: "Arial, sans-serif"
                    }}>
                      Submitted on: {formatDate(event.created_at)}
                    </p>
                  </div>
                </div>

                <p style={{
                  fontSize: "1rem",
                  color: "#2f4b87",
                  lineHeight: 1.6,
                  margin: "0 0 1rem 0",
                  fontFamily: "Arial, sans-serif"
                }}>
                  {event.description}
                </p>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem"
                }}>
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "#122645" }}>Event Date:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "#122645" }}>Registration Deadline:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                      {formatDate(event.expiry_date_for_registration)}
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "#122645" }}>Location:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                      {event.location}
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "#122645" }}>Registration Link:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
                      <a 
                        href={event.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: "#2563eb", textDecoration: "underline" }}
                      >
                        {event.link}
                      </a>
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button
                    onClick={() => handleApproveEvent(event.id)}
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
                    Approve Event
                  </button>
                  <button
                    onClick={() => handleRejectEvent(event.id)}
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
                    Reject Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}