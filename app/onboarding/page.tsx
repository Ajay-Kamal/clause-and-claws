"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "./Onboarding.module.css";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const slugifyUsername = (username: string): string => {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
};

export default function Onboarding() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const [usernameInputError, setUsernameInputError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        setCurrentUser(user);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else if (data) {
          if (data.username && data.full_name) {
            router.push("/");
          } else {
            setProfile(data);
            setAvatarPreview(data.avatar_url || "/default-avatar.webp");
            setFormData(prev => ({
              ...prev,
              username: data.username || "",
              full_name: data.full_name || "",
              bio: data.bio || "",
              location: data.location || "",
              profession: data.profession || "",
              link: data.link || "",
            }));
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    location: "",
    profession: "",
    link: "",
    avatar_url: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      const available = !data || (currentUser && data.id === currentUser.id);
      setUsernameAvailable(available);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const onChange = (key: string, value: string) => {
    if (key === "username") {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasSpace = /\s/.test(value);
      const hasInvalidSymbols = /[^a-zA-Z0-9_]/.test(value);

      if (hasUpperCase) {
        setUsernameInputError("Username cannot contain uppercase letters");
      } else if (hasSpace) {
        setUsernameInputError("Username cannot contain spaces");
      } else if (hasInvalidSymbols) {
        setUsernameInputError(
          "Username can only contain letters, numbers and underscore (_)"
        );
      } else {
        setUsernameInputError("");
      }

      const processedValue = value
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);

      setFormData((prev) => ({ ...prev, [key]: processedValue }));
      setUsernameAvailable(null);

      if (errors.username) {
        setErrors((prev) => ({ ...prev, username: "" }));
      }

      if (processedValue.length >= 3 && !usernameInputError) {
        const timeoutId = setTimeout(() => {
          checkUsername(processedValue);
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "File size must be less than 50KB",
      }));
      return;
    }

    if (file.type !== "image/webp") {
      setErrors((prev) => ({ ...prev, avatar: "File must be in WEBP format" }));
      return;
    }

    setErrors((prev) => ({ ...prev, avatar: "" }));
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const cleanedUsername = slugifyUsername(formData.username);

      if (!cleanedUsername) {
        setErrors({ username: "Username is required" });
        setSubmitting(false);
        return;
      }

      if (!formData.full_name.trim()) {
        setErrors({ full_name: "Full name is required" });
        setSubmitting(false);
        return;
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanedUsername)
        .maybeSingle();

      if (existing && existing.id !== user.id) {
        setErrors({ username: "Username already taken" });
        setSubmitting(false);
        return;
      }

      // Upload avatar if selected
      let avatar_url = profile?.avatar_url || "/default-avatar.webp";
      if (avatarFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`avatars/${user.id}.webp`, avatarFile, { upsert: true });

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
          setErrors({ avatar: "Failed to upload avatar" });
          setSubmitting(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(`avatars/${user.id}.webp`);

        avatar_url = publicData.publicUrl;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...formData,
        username: cleanedUsername,
        avatar_url,
        email: user.email,
      });

      if (!error) {
        router.push("/");
      } else {
        console.error("Profile update error:", error);
        setErrors({ _form: "Failed to complete profile: " + error.message });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrors({ _form: "An unexpected error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 className={styles.title}>Complete Your Profile</h1>
          <p className={styles.subtitle}>
            Tell us a bit about yourself to get started on your journey
          </p>
        </div>

        {errors._form && (
          <div className={styles.errorAlert}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <div>
              <strong>Error</strong>
              <p>{errors._form}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Profile Information</h2>
            
            {/* Avatar Upload */}
            <div className={styles.avatarRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Profile Photo
                </label>
                <div className={styles.avatarSection}>
                  <div className={styles.avatarPreview}>
                    <img
                      src={avatarPreview || "/default-avatar.webp"}
                      alt="Avatar Preview"
                      className={styles.avatarImage}
                    />
                    <div className={styles.avatarOverlay}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.avatarUpload}>
                    <input
                      type="file"
                      accept=".webp"
                      onChange={handleAvatarChange}
                      className={styles.fileInput}
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload" className={styles.fileButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Choose Photo
                    </label>
                    {errors.avatar && (
                      <p className={styles.errorText}>
                        {errors.avatar}
                      </p>
                    )}
                    <p className={styles.helpText}>Max 50KB, WEBP format only</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.fieldRow}>
              {/* Username */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Username *
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputPrefix}>@</span>
                  <input
                    type="text"
                    placeholder="username"
                    required
                    value={formData.username}
                    onChange={(e) => onChange("username", e.target.value)}
                    className={`${styles.input} ${styles.inputWithPrefix} ${
                      usernameInputError ? styles.inputError : ""
                    }`}
                  />
                </div>

                {usernameInputError && (
                  <p className={styles.errorText}>
                    {usernameInputError}
                  </p>
                )}

                {!usernameInputError &&
                  formData.username.length > 0 &&
                  formData.username.length < 3 && (
                    <p className={styles.helpText}>
                      Username must be at least 3 characters
                    </p>
                )}

                {!usernameInputError && formData.username.length >= 3 && (
                  <div className={styles.usernameStatus}>
                    {checkingUsername && (
                      <p className={styles.checkingText}>
                        <span className={styles.miniSpinner}></span>
                        Checking availability...
                      </p>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <p className={styles.successText}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        @{formData.username} is available
                      </p>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <p className={styles.errorText}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        @{formData.username} is already taken
                      </p>
                    )}
                  </div>
                )}

                {errors.username && (
                  <p className={styles.errorText}>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={formData.full_name}
                  onChange={(e) => onChange("full_name", e.target.value)}
                  className={styles.input}
                />
                {errors.full_name && (
                  <p className={styles.errorText}>
                    {errors.full_name}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Bio
              </label>
              <textarea
                placeholder="Tell us about yourself, your interests, or what you're passionate about..."
                value={formData.bio}
                onChange={(e) => onChange("bio", e.target.value)}
                className={styles.textarea}
                rows={4}
              />
              <p className={styles.helpText}>
                {formData.bio.length}/500 characters
              </p>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Additional Information</h2>
            
            <div className={styles.fieldRow}>
              {/* Location */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => onChange("location", e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Profession */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Profession
                </label>
                <input
                  type="text"
                  placeholder="What do you do?"
                  value={formData.profession}
                  onChange={(e) => onChange("profession", e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Website */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Website
              </label>
              <input
                type="url"
                placeholder="https://your-website.com"
                value={formData.link}
                onChange={(e) => onChange("link", e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button
              type="submit"
              disabled={submitting || usernameAvailable === false}
              className={styles.submitButton}
            >
              {submitting ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Creating Profile...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                  </svg>
                  Complete Profile
                </>
              )}
            </button>
            <p className={styles.submitHelpText}>
              You can always update this information later in your profile settings
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}