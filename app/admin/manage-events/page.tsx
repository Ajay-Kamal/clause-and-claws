"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Event {
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
  registered_count: number;
  profiles: {
    full_name: string;
    email: string;
  };
}

type ViewMode = "pending" | "live";

export default function ManageEvents() {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [liveEvents, setLiveEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("pending");

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingEvents();
      fetchLiveEvents();
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
    
    console.log("Fetched pending events:", data);
    setPendingEvents(data || []);
  };

  const fetchLiveEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        profiles!events_created_by_fkey(full_name, email)
      `)
      .eq("status", "approved")
      .order("event_date", { ascending: true });
    
    if (error) {
      console.error("Error fetching live events:", error);
    }
    
    console.log("Fetched live events:", data);
    setLiveEvents(data || []);
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
      fetchLiveEvents();
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

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to DELETE this live event? This will permanently remove it from the system.")) {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event");
      } else {
        alert("Event deleted successfully");
        fetchLiveEvents();
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

  const currentEvents = viewMode === "pending" ? pendingEvents : liveEvents;

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
          margin: "0 0 1.5rem 0",
          fontFamily: "Arial, sans-serif"
        }}>
          {viewMode === "pending" ? "Review and approve pending events" : "Manage live events"}
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
            Pending Events ({pendingEvents.length})
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
            Live Events ({liveEvents.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "3rem 1rem" 
      }}>
        {currentEvents.length === 0 ? (
          <p style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "1.125rem",
            padding: "4rem 2rem",
            fontFamily: "garamond, serif"
          }}>
            {viewMode === "pending" 
              ? "No pending events to review" 
              : "No live events currently"}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {currentEvents.map((event) => (
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
                        marginLeft: "0.5rem",
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
                  {viewMode === "live" && (
                    <div>
                      <strong style={{ fontSize: "0.875rem", color: "#122645" }}>Registrations:</strong>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                        {event.registered_count} users
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  {viewMode === "pending" ? (
                    <>
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
                    </>
                  ) : (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
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
                      Delete Event
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