"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import ConfirmModal from "@/components/ConfirmModal";
import { adminFetch } from "@/utils/adminFetch";

export default function ArticleDetail() {
  const supabase = createSupabaseBrowserClient();
  const params = useParams();
  const id = (params as any)?.id;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (id) fetchArticle(); }, [id]);

  async function fetchArticle() {
    setLoading(true);
    const { data } = await supabase.from("articles").select("*, profiles(username,email)").eq("id", id).maybeSingle();
    setArticle(data || null);
    setLoading(false);
  }

  function openConfirm(title: string, message: string, confirmLabel: string, action: () => Promise<void>) {
    setModalConfig({ title, message, confirmLabel, action });
    setModalOpen(true);
  }
  async function runAction() {
    setActionLoading(true);
    try {
      await modalConfig.action();
      await fetchArticle();
      setModalOpen(false);
    } catch (err) {
      alert("Action failed: " + (err as any)?.message || "unknown");
    } finally { setActionLoading(false); }
  }

  async function approve() {
    const res = await adminFetch(`/api/admin/articles/${id}/approve`, { method: "POST" });
    if (res?.error) throw new Error(res.error);
    alert("Approved & email sent.");
  }

  async function reject() {
    const reason = prompt("Enter rejection reason (min 10 chars):") || "";
    if (reason.trim().length < 10) return alert("Reason too short");
    const res = await adminFetch(`/api/admin/articles/${id}/reject`, { method: "POST", body: { rejection_reason: reason } });
    if (res?.error) throw new Error(res.error);
    alert("Rejected & email sent.");
  }

  async function verifyPublish() {
    const res = await adminFetch(`/api/admin/articles/${id}/verify-and-publish`, { method: "POST" });
    if (res?.error) throw new Error(res.error);
    alert("Verified & published.");
  }

  async function unpublish() {
    const res = await adminFetch(`/api/admin/articles/${id}/unpublish`, { method: "POST" });
    if (res?.error) throw new Error(res.error);
    alert("Unpublished.");
  }

  if (loading) return <div>Loading...</div>;
  if (!article) return <div>Article not found.</div>;

  return (
    <div>
      <ConfirmModal open={modalOpen} title={modalConfig?.title} message={modalConfig?.message} confirmLabel={modalConfig?.confirmLabel} loading={actionLoading} onConfirm={runAction} onClose={() => setModalOpen(false)} />
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <p className="text-sm text-gray-600">Author: {article.profiles?.username} • {new Date(article.created_at).toLocaleString()}</p>
      <p className="mt-4">{article.abstract}</p>
      <p className="mt-3 text-sm">Tags: {article.tags?.join(", ")}</p>

      <div className="mt-4 flex gap-2">
        {(!article.approved && article.rejection_reason == null) && (
          <>
            <button onClick={() => openConfirm("Approve article?", "Approve and send approval email with UTR link.", "Approve & Send", async () => await approve())} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
            <button onClick={() => openConfirm("Reject article?", "Reject the article and send rejection email.", "Reject", async () => await reject())} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
          </>
        )}

        {article.approved && article.payment_submitted && !article.payment_done && (
          <button onClick={() => openConfirm("Verify & publish?", "Verify payment and publish the article immediately.", "Verify & Publish", async () => await verifyPublish())} className="px-3 py-1 bg-green-600 text-white rounded">Verify & Publish</button>
        )}

        {article.published && <button onClick={() => openConfirm("Unpublish?", "Unpublish this article.", "Unpublish", async () => await unpublish())} className="px-3 py-1 border rounded">Unpublish</button>}
      </div>

      <div className="mt-6">
        <a className="text-sm text-blue-600" href={article.file_url} target="_blank" rel="noreferrer">Download file</a>
      </div>
    </div>
  );
}
