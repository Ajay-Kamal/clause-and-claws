"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../../../styles/UploadArticle.module.css";
import GoogleModal from "@/components/GoogleModal";
import CoAuthorSelector from "@/components/CoAuthorSelector";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const LAW_CATEGORIES = {
  "Core Categories of Law": [
    "Constitutional Law",
    "Criminal Law",
    "Civil Law",
    "Contract Law",
    "Tort Law",
    "Property Law",
    "Family Law",
    "Evidence Law",
    "Procedural Law (CPC & CrPC)",
  ],
  "Specialized & Applied Branches": [
    "Corporate & Company Law",
    "Commercial Law",
    "Banking & Finance Law",
    "Intellectual Property Rights (IPR)",
    "Competition / Antitrust Law",
    "Consumer Protection Law",
    "Insurance Law",
    "Taxation Law",
    "International Trade Law",
    "Investment & Securities Law",
  ],
  "Public & Regulatory Laws": [
    "Administrative Law",
    "Environmental Law",
    "Labour & Employment Law",
    "Energy & Mining Law",
    "Cyber Law / Information Technology Law",
    "Media & Entertainment Law",
    "Telecommunications Law",
    "Healthcare & Medical Law",
    "Education Law",
    "Transportation & Maritime Law",
  ],
  "International & Comparative Law": [
    "Public International Law",
    "Private International Law",
    "Human Rights Law",
    "Humanitarian & Refugee Law",
    "Space Law",
    "Comparative Law",
  ],
  "Emerging & Interdisciplinary Fields": [
    "Artificial Intelligence & Law",
    "Data Protection & Privacy Law",
    "FinTech & Cryptocurrency Law",
    "Sports Law",
    "Aviation & Aerospace Law",
    "Maritime & Admiralty Law",
    "Military & Security Law",
    "Agricultural & Food Law",
    "Fashion Law",
  ],
  "Litigation & Dispute Resolution": [
    "Alternative Dispute Resolution (ADR)",
    "Arbitration Law",
    "Mediation & Negotiation",
    "Judicial Process & Court Practice",
  ],
  "Socio-Legal & Theoretical Studies": [
    "Law & Economics",
    "Law & Technology",
    "Law & Society",
    "Jurisprudence & Legal Philosophy",
    "Legal History & Evolution of Law",
    "Feminist Legal Studies",
    "Critical Legal Studies",
  ],
};

export default function EditDraft() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    tags: [] as string[],
    file: null as File | null,
    thumbnail: null as File | null,
    type: "Article",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [thumbDragActive, setThumbDragActive] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCoAuthors, setSelectedCoAuthors] = useState<
    Array<{
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string;
    }>
  >([]);

  const DEFAULT_THUMBNAIL =
    process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL ??
    "https://rvydvbikckoourvzhyml.supabase.co/storage/v1/object/public/thumbnails/default%20thubnail.webp";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setShowGoogleModal(true);
          return;
        }
        setUser(user);

        // Fetch draft article
        const { data: article, error } = await supabase
          .from("articles")
          .select("*, article_coauthors(coauthor_id, profiles(id, username, full_name, avatar_url))")
          .eq("slug", slug)
          .eq("author_id", user.id)
          .eq("draft", true)
          .single();

        if (error || !article) {
          alert("Draft not found or you don't have permission to edit it.");
          router.push("/drafts");
          return;
        }

        // Set article ID and existing URLs
        setArticleId(article.id);
        setExistingFileUrl(article.file_url);
        setExistingThumbnailUrl(article.thumbnail_url);

        // Populate form data
        setFormData({
          title: article.title || "",
          abstract: article.abstract || "",
          tags: article.tags || [],
          file: null,
          thumbnail: null,
          type: article.type || "Article",
        });

        // Populate co-authors
        if (article.article_coauthors) {
          const coauthors = article.article_coauthors
            .map((ac: any) => ac.profiles)
            .filter(Boolean);
          setSelectedCoAuthors(coauthors);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        alert("Failed to load draft.");
        router.push("/drafts");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadDraft();
    }
  }, [slug, router]);

  const generateUniqueSlug = async (baseSlug: string, currentArticleId: string): Promise<string> => {
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", uniqueSlug)
        .neq("id", currentArticleId)
        .maybeSingle();

      if (!data) return uniqueSlug;

      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  useEffect(() => {
    if (formData.title.trim()) {
      const baseSlug = generateSlug(formData.title);
      setGeneratedSlug(baseSlug);
    } else {
      setGeneratedSlug("");
    }
  }, [formData.title]);

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) return "File size must be less than 10MB";

    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return "Please upload a PDF file";
    }
    return null;
  };

  const validateThumbnail = (file: File): string | null => {
    const maxSize = 100 * 1024;
    if (file.size > maxSize) return "Thumbnail must be less than 100 KB";

    const allowedTypes = ["image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Thumbnail must be WebP format";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, file: error }));
      return;
    }
    setFormData((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleThumbnailSelect = (file: File) => {
    const error = validateThumbnail(file);
    if (error) {
      setErrors((prev) => ({ ...prev, thumbnail: error }));
      return;
    }
    setFormData((prev) => ({ ...prev, thumbnail: file }));
    setErrors((prev) => ({ ...prev, thumbnail: "" }));
  };

  const handleTagSelect = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleThumbDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleThumbnailSelect(file);
  };

  // Update Draft Function
  const handleUpdateDraft = async () => {
    setErrors({});
    setSavingDraft(true);

    try {
      if (!formData.title.trim()) {
        setErrors({ title: "Title is required to save draft" });
        setSavingDraft(false);
        return;
      }

      if (!articleId) {
        setErrors({ _form: "Article ID not found" });
        setSavingDraft(false);
        return;
      }

      const baseSlug = generateSlug(formData.title);
      const uniqueSlug = await generateUniqueSlug(baseSlug, articleId);

      let fileUrl = existingFileUrl;
      let thumbnailPublicUrl = existingThumbnailUrl || DEFAULT_THUMBNAIL;

      // Upload new file if selected
      if (formData.file) {
        const fileExt = formData.file.name.split(".").pop();
        const fileName = `${uniqueSlug}-${Date.now()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("articles")
          .upload(filePath, formData.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setErrors({ file: "Failed to upload file: " + uploadError.message });
          setSavingDraft(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("articles")
          .getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;

        // Delete old file if exists
        if (existingFileUrl) {
          const oldFileName = existingFileUrl.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("articles").remove([`articles/${oldFileName}`]);
          }
        }
      }

      // Upload new thumbnail if selected
      if (formData.thumbnail) {
        const thumbErr = validateThumbnail(formData.thumbnail);
        if (!thumbErr) {
          const thumbExt = formData.thumbnail.name.split(".").pop() ?? "webp";
          const thumbName = `${uniqueSlug}-thumb-${Date.now()}.${thumbExt}`;
          const thumbPath = `${user.id}/${thumbName}`;

          const { error: thumbError } = await supabase.storage
            .from("thumbnails")
            .upload(thumbPath, formData.thumbnail, {
              cacheControl: "3600",
              upsert: false,
            });

          if (!thumbError) {
            const { data: thumbUrlData } = supabase.storage
              .from("thumbnails")
              .getPublicUrl(thumbPath);
            thumbnailPublicUrl = thumbUrlData.publicUrl;

            // Delete old thumbnail if exists and not default
            if (existingThumbnailUrl && existingThumbnailUrl !== DEFAULT_THUMBNAIL) {
              const oldThumbName = existingThumbnailUrl.split("/").pop();
              if (oldThumbName) {
                await supabase.storage
                  .from("thumbnails")
                  .remove([`${user.id}/${oldThumbName}`]);
              }
            }
          }
        }
      }

      // Update draft article
      const { error: dbError } = await supabase
        .from("articles")
        .update({
          slug: uniqueSlug,
          title: formData.title.trim(),
          abstract: formData.abstract.trim() || null,
          tags: formData.tags.length > 0 ? formData.tags : null,
          filename: formData.file?.name || null,
          file_url: fileUrl,
          thumbnail_url: thumbnailPublicUrl,
          type: formData.type,
          draft: true,
        })
        .eq("id", articleId);

      if (dbError) {
        setErrors({ _form: "Failed to update draft: " + dbError.message });
        setSavingDraft(false);
        return;
      }

      // Update co-authors
      // First delete existing co-authors
      await supabase.from("article_coauthors").delete().eq("article_id", articleId);

      // Then insert new ones
      if (selectedCoAuthors.length > 0) {
        const coauthorInserts = selectedCoAuthors.map((coauthor) => ({
          article_id: articleId,
          coauthor_id: coauthor.id,
        }));

        await supabase.from("article_coauthors").insert(coauthorInserts);
      }

      alert("Draft updated successfully!");
      router.push("/drafts");
    } catch (error) {
      console.error(error);
      setErrors({ _form: "An unexpected error occurred while updating draft" });
    } finally {
      setSavingDraft(false);
    }
  };

  // Submit for Review Function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setUploading(true);
    setUploadProgress(0);

    try {
      if (!formData.title.trim()) {
        setErrors({ title: "Title is required" });
        setUploading(false);
        return;
      }
      if (!formData.abstract.trim()) {
        setErrors({ abstract: "Abstract is required" });
        setUploading(false);
        return;
      }
      if (!formData.file && !existingFileUrl) {
        setErrors({ file: "Please select a file to upload" });
        setUploading(false);
        return;
      }

      if (!articleId) {
        setErrors({ _form: "Article ID not found" });
        setUploading(false);
        return;
      }

      setUploadProgress(10);

      const baseSlug = generateSlug(formData.title);
      const uniqueSlug = await generateUniqueSlug(baseSlug, articleId);

      setUploadProgress(20);

      let fileUrl = existingFileUrl;

      // Upload new file if selected
      if (formData.file) {
        const fileExt = formData.file.name.split(".").pop();
        const fileName = `${uniqueSlug}-${Date.now()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("articles")
          .upload(filePath, formData.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setErrors({ file: "Failed to upload file: " + uploadError.message });
          setUploading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("articles")
          .getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;

        // Delete old file
        if (existingFileUrl) {
          const oldFileName = existingFileUrl.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("articles").remove([`articles/${oldFileName}`]);
          }
        }
      }

      setUploadProgress(50);

      let thumbnailPublicUrl = existingThumbnailUrl || DEFAULT_THUMBNAIL;

      // Upload new thumbnail if selected
      if (formData.thumbnail) {
        const thumbErr = validateThumbnail(formData.thumbnail);
        if (thumbErr) {
          setErrors((prev) => ({ ...prev, thumbnail: thumbErr }));
          setUploading(false);
          return;
        }

        const thumbExt = formData.thumbnail.name.split(".").pop() ?? "webp";
        const thumbName = `${uniqueSlug}-thumb-${Date.now()}.${thumbExt}`;
        const thumbPath = `${user.id}/${thumbName}`;

        const { error: thumbError } = await supabase.storage
          .from("thumbnails")
          .upload(thumbPath, formData.thumbnail, {
            cacheControl: "3600",
            upsert: false,
          });

        if (thumbError) {
          setErrors({
            thumbnail: "Failed to upload thumbnail: " + thumbError.message,
          });
          setUploading(false);
          return;
        }

        const { data: thumbUrlData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbPath);
        thumbnailPublicUrl = thumbUrlData.publicUrl;

        // Delete old thumbnail
        if (existingThumbnailUrl && existingThumbnailUrl !== DEFAULT_THUMBNAIL) {
          const oldThumbName = existingThumbnailUrl.split("/").pop();
          if (oldThumbName) {
            await supabase.storage
              .from("thumbnails")
              .remove([`${user.id}/${oldThumbName}`]);
          }
        }
      }

      setUploadProgress(60);

      // Add watermark
      const watermarkRes = await fetch("/api/watermark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: uniqueSlug,
          pdfUrl: fileUrl,
          logoUrl: `${window.location.origin}/images/final-logo.png`,
        }),
      });

      const watermarkData = await watermarkRes.json();

      if (!watermarkData.success) {
        setErrors({ _form: "Failed to add watermark: " + watermarkData.error });
        setUploading(false);
        return;
      }

      const watermarkedPdfUrl = watermarkData.watermarkedPdfUrl;
      setUploadProgress(75);

      // Update article to submitted status
      const { error: dbError } = await supabase
        .from("articles")
        .update({
          slug: uniqueSlug,
          title: formData.title.trim(),
          abstract: formData.abstract.trim(),
          tags: formData.tags.length > 0 ? formData.tags : null,
          filename: formData.file?.name || existingFileUrl?.split("/").pop() || null,
          file_url: fileUrl,
          watermarked_pdf_url: watermarkedPdfUrl,
          thumbnail_url: thumbnailPublicUrl,
          type: formData.type,
          draft: false,
        })
        .eq("id", articleId);

      if (dbError) {
        setErrors({ _form: "Failed to submit article: " + dbError.message });
        setUploading(false);
        return;
      }

      // Update co-authors
      await supabase.from("article_coauthors").delete().eq("article_id", articleId);

      if (selectedCoAuthors.length > 0) {
        const coauthorInserts = selectedCoAuthors.map((coauthor) => ({
          article_id: articleId,
          coauthor_id: coauthor.id,
        }));

        await supabase.from("article_coauthors").insert(coauthorInserts);
      }

      setUploadProgress(100);
      alert("Article submitted successfully! Check Your Gmail Frequently");
      setTimeout(() => router.push("/"), 500);
    } catch (error) {
      console.error(error);
      setErrors({ _form: "An unexpected error occurred" });
      setUploading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading draft...</div>;

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Edit Draft</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Publication Type <span style={{ color: "red" }}>*</span>
            </label>
            <select
              className={styles.input}
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              required
            >
              <option value="Article">Article</option>
              <option value="Research Paper">Research Paper</option>
              <option value="Case Notes">Case Notes</option>
              <option value="Legislative Comments">Legislative Comments</option>
              <option value="Book Reviews">Book Reviews</option>
            </select>
          </div>

          <div className={styles.guidelines}>
            <h3 className={styles.guidelinesTitle}>Publishing Guidelines</h3>
            <ul className={styles.guidelinesList}>
              <li>
                We provide a platform to people to publish on any Niche
                particularly relating to Law.
              </li>
              <li>
                Word Limit of an article is to be <b>2000</b> words.
              </li>
              <li>
                Follow <b>Bluebook Ed. 21st</b> for Citation.
              </li>
              <li>
                Plagiarism of any kind shall be less than <b>10%</b> of the
                whole project
              </li>
              <li>
                The work must be <b>Original</b> and the property of the
                publisher.
              </li>
              <li>
                The font shall be Times New Roman, Size- 12 for body, Size- 14
                for Headings & Size- 10 for footnotes. Justify your text,
                (CTRL+J).
              </li>
              <li>
                The spacing shall be 1.5 for the body but 1.0 for footnotes.{" "}
              </li>
              <li>
                The Page Layout should be Portrait and the margins should be 2
                cm (All sides: Top, Bottom, Left, Right).
              </li>
              <li>
                For writing case names, use bold & italic font. E.g.:
                <i>KS Puttaswamy vs. Union of India</i> and also mention the
                complete citation in footnotes.
              </li>
              <li>No page borders should be there. </li>
            </ul>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Manuscript Title <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your article title..."
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={styles.input}
              maxLength={200}
            />
            {errors.title && <p className={styles.errorText}>{errors.title}</p>}
            <div className={styles.charCounter}>
              <span>{formData.title.length}/200 characters</span>
              {generatedSlug && (
                <span className={styles.slugText}>New Slug: {generatedSlug}</span>
              )}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Abstract <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              placeholder="Provide a brief summary of your article..."
              value={formData.abstract}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, abstract: e.target.value }))
              }
              className={styles.textarea}
              maxLength={1000}
            />
            {errors.abstract && (
              <p className={styles.errorText}>{errors.abstract}</p>
            )}
            <div className={styles.charCounter}>
              <span>{formData.abstract.length}/1000 characters</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tags (Optional)</label>
            <div className={styles.tagsSection}>
              <div className={styles.dropdownContainer} ref={dropdownRef}>
                <div
                  className={styles.dropdown}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDropdownOpen(!dropdownOpen);
                    }
                    if (e.key === "Escape") {
                      setDropdownOpen(false);
                    }
                  }}
                >
                  <span className={styles.dropdownText}>
                    Select law categories and topics...
                  </span>
                  <svg
                    className={`${styles.dropdownArrow} ${
                      dropdownOpen ? styles.dropdownArrowOpen : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {Object.entries(LAW_CATEGORIES).map(([category, tags]) => (
                      <div key={category} className={styles.categoryGroup}>
                        <div className={styles.categoryTitle}>{category}</div>
                        <div className={styles.categoryOptions}>
                          {tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagSelect(tag)}
                              className={`${styles.dropdownOption} ${
                                formData.tags.includes(tag)
                                  ? styles.dropdownOptionSelected
                                  : ""
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.tags.length > 0 && (
                <>
                  <div className={styles.selectedTagsContainer}>
                    {formData.tags.map((tag) => (
                      <div key={tag} className={styles.selectedTag}>
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className={styles.removeTagButton}
                          aria-label={`Remove ${tag} tag`}
                        >
                          <svg
                            className={styles.removeTagIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className={styles.selectedTagsCount}>
                    {formData.tags.length} tag
                    {formData.tags.length !== 1 ? "s" : ""} selected
                  </p>
                </>
              )}
            </div>
          </div>

          <CoAuthorSelector
            selectedCoAuthors={selectedCoAuthors}
            onCoAuthorsChange={setSelectedCoAuthors}
            currentUserId={user?.id}
          />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Manuscript File {existingFileUrl && <span style={{ color: "green" }}>(File already uploaded)</span>}
            </label>
            <div
              className={`${styles.dropZone} ${
                dragActive
                  ? styles.dropZoneActive
                  : errors.file
                  ? styles.dropZoneError
                  : styles.dropZoneDefault
              }`}
              onDrop={handleDrop}
              onDragOver={handleDrag}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
            >
              {formData.file ? (
                <div className={styles.fileSelected}>
                  <div className={styles.fileIcon}>
                    <svg
                      className={styles.successIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className={styles.fileName}>{formData.file.name}</p>
                  <p className={styles.fileSize}>
                    {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, file: null }))
                    }
                    className={styles.removeButton}
                  >
                    Remove file
                  </button>
                </div>
              ) : existingFileUrl ? (
                <div className={styles.fileSelected}>
                  <div className={styles.fileIcon}>
                    <svg
                      className={styles.successIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className={styles.fileName}>Current file uploaded</p>
                  <p className={styles.fileSize} style={{ color: "#5A6B7D" }}>
                    Upload a new file to replace it
                  </p>
                  <label className={styles.browseLink}>
                    Choose new file
                    <input
                      type="file"
                      className={styles.hiddenInput}
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className={styles.uploadInstructions}>
                  <div>
                    <p className={styles.uploadText}>
                      Drop your article here, or{" "}
                      <label className={styles.browseLink}>
                        browse files
                        <input
                          type="file"
                          className={styles.hiddenInput}
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                        />
                      </label>
                    </p>
                    <p className={styles.supportedFormats}>
                      Supported format: PDF Only
                    </p>
                    <p className={styles.supportedFormats}>
                      Maximum file size: 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            {errors.file && <p className={styles.errorText}>{errors.file}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Thumbnail (Optional) — WebP, max 100 KB
            </label>
            <div
              className={`${styles.thumbnailDropZone} ${
                thumbDragActive
                  ? styles.dropZoneActive
                  : errors.thumbnail
                  ? styles.dropZoneError
                  : styles.dropZoneDefault
              }`}
              onDrop={handleThumbDrop}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDragEnter={() => setThumbDragActive(true)}
              onDragLeave={() => setThumbDragActive(false)}
            >
              {formData.thumbnail ? (
                <div className={styles.thumbnailPreview}>
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="Thumbnail preview"
                    className={styles.thumbnailImage}
                  />
                  <p>{formData.thumbnail.name}</p>
                  <p className={styles.fileSize}>
                    {(formData.thumbnail.size / 1024).toFixed(0)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, thumbnail: null }))
                    }
                    className={styles.removeButton}
                  >
                    Remove thumbnail
                  </button>
                </div>
              ) : existingThumbnailUrl ? (
                <div className={styles.thumbnailPreview}>
                  <img
                    src={existingThumbnailUrl}
                    alt="Current thumbnail"
                    className={styles.thumbnailImage}
                  />
                  <p>Current thumbnail</p>
                  <label className={styles.browseLink}>
                    Upload new thumbnail
                    <input
                      type="file"
                      className={styles.hiddenInput}
                      accept="image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailSelect(file);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <p>
                    Drop your thumbnail here, or{" "}
                    <label className={styles.browseLink}>
                      browse
                      <input
                        type="file"
                        className={styles.hiddenInput}
                        accept="image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleThumbnailSelect(file);
                        }}
                      />
                    </label>
                  </p>
                  <p className={styles.supportedFormats}>
                    Supported: WebP only | Max size: 100 KB
                  </p>
                  <p className={styles.supportedFormats}>
                    If you don't upload a thumbnail, the default will be used.
                  </p>
                </div>
              )}
            </div>
            {errors.thumbnail && (
              <p className={styles.errorText}>{errors.thumbnail}</p>
            )}
          </div>

          {(uploading || savingDraft) && (
            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span>{savingDraft ? "Updating Draft..." : "Submitting..."}</span>
                {uploading && <span>{uploadProgress}%</span>}
              </div>
              {uploading && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {errors._form && (
            <div className={styles.errorAlert}>{errors._form}</div>
          )}

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleUpdateDraft}
              className={styles.draftButton}
              disabled={uploading || savingDraft || !formData.title.trim()}
            >
              {savingDraft ? "Updating..." : "Update Draft"}
            </button>

            <button
              type="submit"
              disabled={
                uploading ||
                savingDraft ||
                !formData.title.trim() ||
                !formData.abstract.trim() ||
                (!formData.file && !existingFileUrl)
              }
              className={styles.submitButton}
            >
              {uploading ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>

      <GoogleModal
        showModal={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSignIn={handleSignIn}
        isLoading={isLoading}
      />
    </>
  );
}