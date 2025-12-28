// ============================================
// CreateEvent.tsx - Admin Component
// ============================================
"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    type_of: "Webinar",
    title: "",
    description: "",
    link: "",
    expiry_date_for_registration: "",
    event_date: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("events").insert([formData]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Event created successfully!");
      setFormData({
        type_of: "Webinar",
        title: "",
        description: "",
        link: "",
        expiry_date_for_registration: "",
        event_date: "",
        location: "",
      });
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", fontFamily: "garamond" }}>
        Create New Event
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Event Type
          </label>
          <select
            value={formData.type_of}
            onChange={(e) => setFormData({ ...formData, type_of: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
            required
          >
            <option value="Webinar">Webinar</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Event Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
              resize: "vertical",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Registration Link
          </label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Event Date
            </label>
            <input
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              value={formData.expiry_date_for_registration}
              onChange={(e) =>
                setFormData({ ...formData, expiry_date_for_registration: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Online or Physical Location"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
            required
          />
        </div>

        {message && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              backgroundColor: message.includes("Error") ? "#fee2e2" : "#d1fae5",
              color: message.includes("Error") ? "#dc2626" : "#065f46",
            }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: "#ffd700",
            color: "#122645",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};
