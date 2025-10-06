"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../../styles/UploadArticle.module.css";
import GoogleModal from "@/components/GoogleModal";

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

export default function UploadArticle() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    tags: [] as string[],
    file: null as File | null,
    thumbnail: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [thumbDragActive, setThumbDragActive] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setShowGoogleModal(true);
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

    const allowedTypes = [
      "application/pdf",
    ];
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

      // const pdf2htmlRes = await fetch("/api/pdf2html", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ slug: uniqueSlug, pdfUrl: urlData.publicUrl }),
      // });
      // const pdf2htmlData = await pdf2htmlRes.json();
      // if (!pdf2htmlData.htmlUrl) {
      //   throw new Error("Failed to convert PDF to HTML");
      // }

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
          console.log(thumbError);
          setUploading(false);
          return;
        }

        const { data: thumbUrlData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbPath);
        thumbnailPublicUrl = thumbUrlData.publicUrl;
      }

      setUploadProgress(60); // optional, show progress

      const watermarkRes = await fetch("/api/watermark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: uniqueSlug, // or articleId if you have it generated after DB insert
          pdfUrl: urlData.publicUrl, // uploaded PDF public URL
          logoUrl: `${window.location.origin}/images/final-logo.png`, // your logo URL
        }),
      });

      const watermarkData = await watermarkRes.json();

      if (!watermarkData.success) {
        setErrors({ _form: "Failed to add watermark: " + watermarkData.error });
        console.log("Watermark Error:", watermarkData.error);
        setUploading(false);
        return;
      }

      const watermarkedPdfUrl = watermarkData.watermarkedPdfUrl;
      setUploadProgress(75);

      // setUploadProgress(75);
      // {console.log(pdf2htmlData.htmlUrl)}

      const { error: dbError } = await supabase.from("articles").insert({
        author_id: user.id,
        slug: uniqueSlug,
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        tags: formData.tags.length > 0 ? formData.tags : null,
        filename: formData.file.name,
        file_url: urlData.publicUrl, // original PDF
        watermarked_pdf_url: watermarkedPdfUrl,
        // html_url: pdf2htmlData.htmlUrl, // watermarked PDF
        thumbnail_url: thumbnailPublicUrl,
        views: 0,
        likes: 0,
        is_featured: false,
        published: false,
      });

      if (dbError) {
        await supabase.storage.from("articles").remove([filePath]);
        setErrors({ _form: "Failed to save article: " + dbError.message });
        setUploading(false);
        return;
      }

      setUploadProgress(100);
      alert("Article uploaded successfully! Check Your Gmail Frequently");
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
        <h1 className={styles.title}>Upload Article</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
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
              Article Title <span style={{ color: "red" }}>*</span>
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
              required
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
              {/* Dropdown */}
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

          {uploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {errors._form && (
            <div className={styles.errorAlert}>{errors._form}</div>
          )}

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.cancelButton}
              disabled={uploading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                uploading ||
                !formData.title.trim() ||
                !formData.abstract.trim() ||
                !formData.file
              }
              className={styles.submitButton}
            >
              {uploading ? "Publishing..." : "Submit Article"}
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
