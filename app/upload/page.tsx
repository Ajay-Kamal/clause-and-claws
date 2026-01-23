"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../../styles/UploadArticle.module.css";
import GoogleModal from "@/components/GoogleModal";
import CoAuthorSelector from "@/components/CoAuthorSelector";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  "Geopolitical & International Affairs Tags (Broad-Level)": [
    "Global Governance & Diplomacy",
    "International Relations & Law",
    "National Security & Strategic Affairs",
    "Defence & Military Law",
    "Foreign Policy & Treaties",
    "Border Disputes & Territorial Law",
    "International trade & Economic Sanctions",
    "Maritime & Space Governance",
    "Global Humanitarian Law",
    "South Asian Geopolitics",
  ],
};

export default function UploadArticle() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [convertingImage, setConvertingImage] = useState(false);

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
  const [consentChecked, setConsentChecked] = useState(false);

  const DEFAULT_THUMBNAIL =
    process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL ??
    "https://rvydvbikckoourvzhyml.supabase.co/storage/v1/object/public/thumbnails/default%20thubnail.webp";

  // Function to convert image to WebP
  const convertToWebP = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to convert image"));
                return;
              }

              const webpFile = new File(
                [blob],
                file.name.replace(/\.(jpe?g|png)$/i, ".webp"),
                { type: "image/webp" },
              );

              resolve(webpFile);
            },
            "image/webp",
            0.9, // Quality setting (0-1)
          );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

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
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          alert("Please sign in before uploading an article.");
          setShowGoogleModal(true);
          setUploading(false);
          setSavingDraft(false);
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Auth error:", error);
        setShowGoogleModal(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", uniqueSlug)
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

  const handleThumbnailSelect = async (file: File) => {
    // Check if file is JPEG/JPG and needs conversion
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      setConvertingImage(true);
      setErrors((prev) => ({ ...prev, thumbnail: "" }));

      try {
        const webpFile = await convertToWebP(file);

        // Validate the converted WebP file
        const error = validateThumbnail(webpFile);
        if (error) {
          setErrors((prev) => ({ ...prev, thumbnail: error }));
          setConvertingImage(false);
          return;
        }

        setFormData((prev) => ({ ...prev, thumbnail: webpFile }));
        setErrors((prev) => ({ ...prev, thumbnail: "" }));
      } catch (error) {
        console.error("Conversion error:", error);
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Failed to convert image to WebP format",
        }));
      } finally {
        setConvertingImage(false);
      }
    } else if (file.type === "image/webp") {
      // Already WebP, just validate
      const error = validateThumbnail(file);
      if (error) {
        setErrors((prev) => ({ ...prev, thumbnail: error }));
        return;
      }
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        thumbnail: "Please upload a JPEG, JPG, or WebP image",
      }));
    }
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

  const handleSaveDraft = async () => {
    if (!user) {
      alert("Please sign in before saving a draft.");
      setShowGoogleModal(true);
      return;
    }
    setErrors({});
    setSavingDraft(true);

    try {
      if (!formData.title.trim()) {
        setErrors({ title: "Title is required to save draft" });
        setSavingDraft(false);
        return;
      }

      const baseSlug = generateSlug(formData.title);
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      let fileUrl = null;
      let thumbnailPublicUrl = DEFAULT_THUMBNAIL;

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
      }

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
          }
        }
      }

      const { data: articleData, error: dbError } = await supabase
        .from("articles")
        .insert({
          author_id: user.id,
          slug: uniqueSlug,
          title: formData.title.trim(),
          abstract: formData.abstract.trim() || null,
          tags: formData.tags.length > 0 ? formData.tags : null,
          filename: formData.file?.name || null,
          file_url: fileUrl,
          watermarked_pdf_url: null,
          thumbnail_url: thumbnailPublicUrl,
          type: formData.type,
          views: 0,
          likes: 0,
          is_featured: false,
          published: false,
          draft: true,
        })
        .select()
        .single();

      if (dbError) {
        setErrors({ _form: "Failed to save draft: " + dbError.message });
        setSavingDraft(false);
        return;
      }

      if (selectedCoAuthors.length > 0 && articleData) {
        const coauthorInserts = selectedCoAuthors.map((coauthor) => ({
          article_id: articleData.id,
          coauthor_id: coauthor.id,
        }));

        await supabase.from("article_coauthors").insert(coauthorInserts);
      }

      alert(
        "Draft saved successfully! You can continue editing from My Drafts page.",
      );
      router.push("/drafts");
    } catch (error) {
      console.error(error);
      setErrors({ _form: "An unexpected error occurred while saving draft" });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in before submitting an article.");
      setShowGoogleModal(true);
      return;
    }
    if (!consentChecked) {
      setErrors({
        ...errors,
        consent: "You must accept the copyright agreement to submit.",
      });
      return;
    }
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
      if (!formData.file) {
        setErrors({ file: "Please select a file to upload" });
        setUploading(false);
        return;
      }

      setUploadProgress(10);

      const baseSlug = generateSlug(formData.title);
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      setUploadProgress(20);

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

      setUploadProgress(50);
      const { data: urlData } = supabase.storage
        .from("articles")
        .getPublicUrl(filePath);

      let thumbnailPublicUrl = DEFAULT_THUMBNAIL;

      if (formData.thumbnail) {
        const thumbErr = validateThumbnail(formData.thumbnail);
        if (thumbErr) {
          setErrors((prev) => ({ ...prev, thumbnail: thumbErr }));
          await supabase.storage.from("articles").remove([filePath]);
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
          await supabase.storage.from("articles").remove([filePath]);
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
      }

      setUploadProgress(60);

      const watermarkRes = await fetch("/api/watermark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: uniqueSlug,
          pdfUrl: urlData.publicUrl,
          logoUrl: `${window.location.origin}/images/final-logo.png`,
        }),
      });

      const watermarkData = await watermarkRes.json();

      if (!watermarkData.success) {
        setErrors({ _form: "Failed to add watermark: " + watermarkData.error });
        await supabase.storage.from("articles").remove([filePath]);
        setUploading(false);
        return;
      }

      const watermarkedPdfUrl = watermarkData.watermarkedPdfUrl;
      setUploadProgress(75);

      const { data: articleData, error: dbError } = await supabase
        .from("articles")
        .insert({
          author_id: user.id,
          slug: uniqueSlug,
          title: formData.title.trim(),
          abstract: formData.abstract.trim(),
          tags: formData.tags.length > 0 ? formData.tags : null,
          filename: formData.file.name,
          file_url: urlData.publicUrl,
          watermarked_pdf_url: watermarkedPdfUrl,
          thumbnail_url: thumbnailPublicUrl,
          type: formData.type,
          views: 0,
          likes: 0,
          is_featured: false,
          published: false,
          draft: false,
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage.from("articles").remove([filePath]);
        setErrors({ _form: "Failed to save article: " + dbError.message });
        setUploading(false);
        return;
      }

      setUploadProgress(85);

      if (selectedCoAuthors.length > 0 && articleData) {
        const coauthorInserts = selectedCoAuthors.map((coauthor) => ({
          article_id: articleData.id,
          coauthor_id: coauthor.id,
          accepted: false,
          invited_at: new Date().toISOString(),
        }));

        const { error: coauthorError } = await supabase
          .from("article_coauthors")
          .insert(coauthorInserts);

        if (coauthorError) {
          console.error("Error adding co-authors:", coauthorError);
        } else {
          try {
            const { data: authorProfile } = await supabase
              .from("profiles")
              .select("full_name, username")
              .eq("id", user.id)
              .single();

            const mainAuthorName =
              authorProfile?.full_name || authorProfile?.username || "Author";

            await fetch("/api/coauthor/invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                articleId: articleData.id,
                articleTitle: formData.title.trim(),
                articleSlug: uniqueSlug,
                mainAuthorName,
                coauthorIds: selectedCoAuthors.map((c) => c.id),
              }),
            });
          } catch (emailErr) {
            console.error("Failed to send co-author invitations:", emailErr);
          }
        }
      }

      setUploadProgress(100);
      alert(
        "Article submitted successfully! Co-author invitations have been sent.",
      );
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

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Upload Manuscript</h1>

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

          <div className={styles.guidelinesButton}>
            <h3 className={styles.guidelinesButtonTitle}>Before You Submit</h3>
            <p className={styles.guidelinesButtonText}>
              Please review our comprehensive submission guidelines to ensure
              your manuscript meets all requirements.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  formData.type === "Article"
                    ? "/guidelines-article"
                    : "/guidelines",
                )
              }
              className={styles.viewGuidelinesButton}
            >
              View Submission Guidelines
            </button>
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
                <span className={styles.slugText}>Slug: {generatedSlug}</span>
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

          {user && (
            <CoAuthorSelector
              selectedCoAuthors={selectedCoAuthors}
              onCoAuthorsChange={setSelectedCoAuthors}
              currentUserId={user.id}
            />
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Manuscript File <span style={{ color: "red" }}>*</span>
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
              Thumbnail (Optional) — JPEG, JPG, or WebP | max 100 KB
            </label>
            {convertingImage && (
              <p className={styles.convertingText}>
                Converting image to WebP format...
              </p>
            )}
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
              ) : (
                <div>
                  <p>
                    Drop your thumbnail here, or{" "}
                    <label className={styles.browseLink}>
                      browse
                      <input
                        type="file"
                        className={styles.hiddenInput}
                        accept="image/webp,image/jpeg,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleThumbnailSelect(file);
                        }}
                      />
                    </label>
                  </p>
                  <p className={styles.supportedFormats}>
                    Supported: JPEG, JPG, WebP | Max size: 100 KB
                  </p>
                  <p className={styles.supportedFormats}>
                    JPEG/JPG images will be automatically converted to WebP
                  </p>
                  <p className={styles.supportedFormats}>
                    If you don't upload a thumbnail, a default thumbnail will be
                    used.
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
                <span>{savingDraft ? "Saving Draft..." : "Uploading..."}</span>
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

          <div className={styles.consentContainer}>
            <div className={styles.consentBox}>
              <div className={styles.consentText}>
                <strong>
                  I hereby irrevocably assign the copyright of the manuscript to
                  the Clause and Claws.
                </strong>
                <ul>
                  <li>
                    The Editor-in-Chief of the Clause and Claws reserves the
                    right to transfer the copyright to a publisher at their
                    discretion.
                  </li>
                  <li>
                    The author(s) retain all proprietary rights, including
                    patent rights and the right to utilize the article in future
                    works; prior written permission from the Editor-in-Chief is
                    required for third-party republication.
                  </li>
                  <li>
                    The material presented is original and does not incorporate
                    other copyrighted content without authorization; such
                    material is properly cited.
                  </li>
                  <li>
                    The final version is not substantially similar to previously
                    published works by the author.
                  </li>
                  <li>
                    The author may post their version of the article with proper
                    acknowledgment and a hyperlink to the published article on
                    the Clause and Claws website.
                  </li>
                  <li>
                    If plagiarism is identified after publication, the author
                    bears full responsibility and absolves Clause and Claws
                    Board members of liability.
                  </li>
                </ul>
              </div>
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => {
                    setConsentChecked(e.target.checked);
                    setErrors((prev) => ({ ...prev, consent: "" }));
                  }}
                  className={styles.consentCheckbox}
                />
                I have read, understood, and agree to the terms above.
              </label>
              {errors.consent && (
                <p className={styles.consentError}>{errors.consent}</p>
              )}
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleSaveDraft}
              className={styles.draftButton}
              disabled={
                uploading ||
                loading ||
                savingDraft ||
                convertingImage ||
                !user ||
                !formData.title.trim()
              }
            >
              {savingDraft ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="submit"
              disabled={
                uploading ||
                savingDraft ||
                convertingImage ||
                !formData.title.trim() ||
                !formData.abstract.trim() ||
                !formData.file ||
                !consentChecked
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
