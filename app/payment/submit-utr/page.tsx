"use client";
import { useEffect, useState } from "react";

export default function SubmitUTRPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<{
    id?: string;
    title?: string;
    slug?: string;
  } | null>(null);
  const [utr, setUtr] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // Extract token from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("token") || "";
      setToken(t);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setMsg("Missing token in URL.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/payment/validate-token?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setMsg(data?.error || "Invalid token");
        } else {
          setArticle(
            data.article || { id: data.article?.id, title: data.article?.title }
          );
        }
      } catch (err) {
        setMsg("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function submitUTR(e: React.FormEvent) {
    e.preventDefault();
    if (!utr.trim()) return setMsg("Enter UTR");
    setMsg(null);
    try {
      const res = await fetch("/api/payment/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, utr_number: utr.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || "Failed to submit");
      } else {
        setMsg("UTR submitted successfully. Admin will verify shortly.");
        setArticle(null);
      }
    } catch (err) {
      setMsg("Submit failed");
    }
  }

  if (loading)
    return (
      <>
        <style>{modalCss}</style>
        <div className="utr-modal-container">
          <div className="utr-modal-box">
            <div className="utr-loader" />
            <div className="utr-modal-title">Validating link...</div>
          </div>
        </div>
      </>
    );
  if (msg && !article)
    return (
      <>
        <style>{modalCss}</style>
        <div className="utr-modal-container">
          <div className="utr-modal-box">
            <div className="utr-modal-title error">
              <ErrorIcon />
              {msg}
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
      <style>{modalCss}</style>
      <div className="utr-modal-container">
        <div className="utr-modal-box">
          <div className="utr-modal-title">
            <TokenIcon />
            Submit UTR
          </div>
          <div className="utr-article">
            <span className="utr-article-label">
              <ArticleIcon /> Article:
            </span>
            <span className="utr-article-title">
              <strong>{article?.title ?? "Unknown"}</strong>
            </span>
          </div>
          <form onSubmit={submitUTR} className="utr-form">
            <label className="utr-label">
              <span>
                <UtrIcon /> UTR / Transaction Reference
              </span>
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="utr-input"
                placeholder="Enter UTR number"
                autoFocus
              />
            </label>
            <button type="submit" className="utr-submit-btn">
              <SendIcon /> Submit UTR
            </button>
          </form>
          {msg && (
            <p
              className={`utr-msg ${
                msg.toLowerCase().includes("success") ? "success" : "error"
              }`}
            >
              {msg}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// --- ICONS ---
function TokenIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      style={{ marginRight: 8, verticalAlign: "middle" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#2563eb"
        strokeWidth="2"
        fill="#e0e7ff"
      />
      <path
        d="M12 7v5l3 2"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ArticleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      style={{ marginRight: 4, verticalAlign: "middle" }}
    >
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="2"
        stroke="#64748b"
        strokeWidth="1.5"
        fill="#f1f5f9"
      />
      <line
        x1="6"
        y1="7"
        x2="14"
        y2="7"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="10"
        x2="14"
        y2="10"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="13"
        x2="11"
        y2="13"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function UtrIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      style={{ marginRight: 4, verticalAlign: "middle" }}
    >
      <rect
        x="2"
        y="4"
        width="16"
        height="12"
        rx="2"
        stroke="#2563eb"
        strokeWidth="1.5"
        fill="#f1f5ff"
      />
      <path
        d="M2 7l8 5 8-5"
        stroke="#2563eb"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      style={{ marginRight: 6, verticalAlign: "middle" }}
    >
      <path
        d="M2 10l15-6-6 15-2-7-7-2z"
        stroke="#fff"
        strokeWidth="1.5"
        fill="#2563eb"
      />
    </svg>
  );
}
function ErrorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      style={{ marginRight: 8, verticalAlign: "middle" }}
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        fill="#fee2e2"
        stroke="#dc2626"
        strokeWidth="1.5"
      />
      <path
        d="M10 6v4"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14" r="1" fill="#dc2626" />
    </svg>
  );
}

// --- CSS ---
const modalCss = `
.utr-modal-container {
  min-height: 100vh;
  background: #f6f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
}
.utr-modal-box {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(68,72,89,0.10);
  max-width: 420px;
  width: 100%;
  padding: 2.2rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  animation: modalPop 0.18s cubic-bezier(.4,1.4,.6,1) both;
}
@keyframes modalPop {
  0% { transform: scale(0.96); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.utr-modal-title {
  font-size: 1.45rem;
  font-weight: 700;
  color: #22223b;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.utr-modal-title.error {
  color: #dc2626;
  font-weight: 600;
}
.utr-article {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
  font-size: 1.05rem;
}
.utr-article-label {
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.utr-article-title {
  color: #22223b;
}
.utr-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  margin-bottom: 0.5rem;
}
.utr-label {
  font-size: 1rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.utr-input {
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  margin-top: 0.2rem;
  outline: none;
  transition: border 0.18s;
  background: #f8fafc;
  color: #22223b;
}
.utr-input:focus {
  border: 1.5px solid #2563eb;
  background: #fff;
}
.utr-submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 0.7rem 1.3rem;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
  margin-top: 0.2rem;
  box-shadow: 0 1px 3px rgba(37,99,235,0.06);
}
.utr-submit-btn:hover, .utr-submit-btn:focus {
  background: #1d4ed8;
}
.utr-msg {
  margin-top: 1.1rem;
  font-size: 1rem;
  border-radius: 6px;
  padding: 0.7em 1em;
  background: #f3f4f6;
  color: #374151;
}
.utr-msg.success {
  background: #e0fce6;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.utr-msg.error {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.utr-loader {
  width: 32px;
  height: 32px;
  border: 4px solid #e0e7ff;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  margin: 0 auto 1.2rem auto;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 600px) {
  .utr-modal-box {
    padding: 1.1rem 0.5rem;
    max-width: 98vw;
  }
  .utr-modal-title {
    font-size: 1.1rem;
  }
}
`;
