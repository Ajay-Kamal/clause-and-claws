"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function AcceptCoAuthor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [state, setState] = useState<
    "valid" | "accepted" | "expired" | "invalid" | "error" | "success"
  >("valid");
  const [invitationData, setInvitationData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      setLoading(false);
      return;
    }

    // Verify token on page load
    fetch(`/api/coauthor/accept?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setState("valid");
          setInvitationData(data);
        } else if (data.already_accepted) {
          setState("accepted");
          setInvitationData(data);
        } else if (data.expired) {
          setState("expired");
          setInvitationData(data);
        } else {
          setState("invalid");
        }
      })
      .catch(() => {
        setState("error");
        setErrorMessage("Failed to verify invitation");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await fetch("/api/coauthor/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setState("success");
        setInvitationData(data);
        // Redirect to article after 3 seconds
        setTimeout(() => {
          router.push(`/articles/${data.article.slug}`);
        }, 3000);
      } else {
        setState("error");
        setErrorMessage(data.error || "Failed to accept invitation");
      }
    } catch (err) {
      setState("error");
      setErrorMessage("An unexpected error occurred");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="lj-loading-root">
          <div className="lj-loading-inner">
            <div className="lj-spinner" />
            <p className="lj-loading-text">Verifying invitation...</p>
          </div>
        </div>

        <style jsx>{`
          .lj-loading-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f9fafb;
            padding: 1rem;
          }

          .lj-loading-inner {
            text-align: center;
          }

          .lj-spinner {
            margin: 0 auto;
            height: 48px;
            width: 48px;
            border-radius: 50%;
            border: 4px solid #e5e7eb;
            border-top-color: #2563eb;
            box-sizing: border-box;
            animation: lj-spin 1s linear infinite;
          }

          .lj-loading-text {
            margin-top: 16px;
            color: #4b5563;
          }

          @keyframes lj-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <div className="page-root">
      <div className="card">
        {state === "valid" && (
          <>
            <div className="header text-center">
              <div className="icon icon-info">
                <AlertCircle className="icon-svg" />
              </div>
              <h1 className="title">Co-Author Invitation</h1>
              <p className="subtitle">You've been invited to be listed as a co-author</p>
            </div>

            <div className="article-box">
              <h2 className="article-title">{invitationData?.article?.title}</h2>
              <p className="article-meta">by {invitationData?.main_author}</p>
              {invitationData?.article?.abstract && (
                <p className="article-abstract">
                  {invitationData.article.abstract.substring(0, 200)}
                  {invitationData.article.abstract.length > 200 && "..."}
                </p>
              )}
            </div>

            <div className="actions">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="btn btn-primary"
              >
                {accepting ? "Accepting..." : "Accept Co-Authorship"}
              </button>

              <button
                onClick={() => router.push("/")}
                className="btn btn-secondary"
              >
                Decline
              </button>
            </div>

            <p className="disclaimer">
              By accepting, your name will be publicly displayed as a co-author on this article.
            </p>
          </>
        )}

        {state === "success" && (
          <div className="center">
            <div className="icon icon-success">
              <CheckCircle className="icon-svg" />
            </div>
            <h1 className="title">Accepted Successfully!</h1>
            <p className="subtitle">You are now listed as a co-author on:</p>
            <p className="article-title-plain">"{invitationData?.article?.title}"</p>
            <p className="muted">Redirecting to article page...</p>
          </div>
        )}

        {state === "accepted" && (
          <div className="center">
            <div className="icon icon-warn">
              <Clock className="icon-svg" />
            </div>
            <h1 className="title">Already Accepted</h1>
            <p className="subtitle">You have already accepted this co-author invitation.</p>
            {invitationData?.article?.slug && (
              <button
                onClick={() => router.push(`/articles/${invitationData.article.slug}`)}
                className="btn btn-primary full"
              >
                View Article
              </button>
            )}
          </div>
        )}

        {state === "expired" && (
          <div className="center">
            <div className="icon icon-error">
              <XCircle className="icon-svg" />
            </div>
            <h1 className="title">Invitation Expired</h1>
            <p className="subtitle">
              This invitation link has expired. Please contact the article author for a new invitation.
            </p>
            <button onClick={() => router.push("/")} className="btn btn-secondary full">
              Go Home
            </button>
          </div>
        )}

        {(state === "invalid" || state === "error") && (
          <div className="center">
            <div className="icon icon-error">
              <XCircle className="icon-svg" />
            </div>
            <h1 className="title">{state === "invalid" ? "Invalid Invitation" : "Error"}</h1>
            <p className="subtitle">
              {errorMessage || "This invitation link is invalid or has been removed."}
            </p>
            <button onClick={() => router.push("/")} className="btn btn-secondary full">
              Go Home
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          padding: 16px;
        }

        .card {
          max-width: 640px;
          width: 100%;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(2, 6, 23, 0.08);
          padding: 32px;
          box-sizing: border-box;
        }

        .text-center {
          text-align: center;
        }

        .header {
          margin-bottom: 24px;
        }

        .icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          margin: 0 auto 12px;
        }

        .icon-info {
          background: #ebf8ff;
        }

        .icon-success {
          background: #ecfdf5;
        }

        .icon-warn {
          background: #fffbeb;
        }

        .icon-error {
          background: #fff1f2;
        }

        .icon-svg {
          width: 28px;
          height: 28px;
          color: #2563eb;
        }

        .icon-success .icon-svg {
          color: #16a34a;
        }

        .icon-warn .icon-svg {
          color: #d97706;
        }

        .icon-error .icon-svg {
          color: #dc2626;
        }

        .title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 6px 0;
        }

        .subtitle {
          color: #4b5563;
          margin: 0;
          font-size: 14px;
        }

        .article-box {
          background: #f9fafb;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 20px;
        }

        .article-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .article-meta {
          margin: 0;
          font-size: 13px;
          color: #374151;
        }

        .article-abstract {
          margin-top: 10px;
          color: #374151;
          font-size: 13px;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }

        .btn {
          display: inline-block;
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn.full {
          width: 100%;
        }

        .btn-primary {
          background-color: #2563eb;
          color: #fff;
        }

        .btn-primary:hover:not([disabled]) {
          background-color: #1e40af;
        }

        .btn-secondary {
          background-color: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background-color: #e5e7eb;
        }

        .btn[disabled] {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .disclaimer {
          font-size: 12px;
          color: #6b7280;
          margin-top: 12px;
          text-align: center;
        }

        .center {
          text-align: center;
        }

        .article-title-plain {
          font-weight: 600;
          color: #0f172a;
          margin: 10px 0 6px;
        }

        .muted {
          color: #6b7280;
          font-size: 13px;
        }

        @media (max-width: 480px) {
          .card {
            padding: 20px;
            border-radius: 10px;
          }

          .icon {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </div>
  );
}