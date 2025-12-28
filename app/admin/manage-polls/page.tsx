"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    
    if (filteredOptions.length < 2) {
      setMessage("Error: Please provide at least 2 options");
      setLoading(false);
      return;
    }

    const pollOptions = filteredOptions.map((opt, idx) => ({
      id: `opt${idx + 1}`,
      text: opt,
      votes: 0,
    }));

    const { error } = await supabase.from("polls").insert([
      {
        question,
        options: pollOptions,
        expiry_date: expiryDate,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Poll created successfully!");
      setQuestion("");
      setOptions(["", ""]);
      setExpiryDate("");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", fontFamily: "garamond" }}>
        Create New Poll
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Poll Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
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
            Poll Options
          </label>
          {options.map((option, index) => (
            <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#122645",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            + Add Option
          </button>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Expiry Date
          </label>
          <input
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
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
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
};