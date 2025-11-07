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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    location: "",
    profession: "",
    link: "",
    avatar_url: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("🔍 Fetching user profile...");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("❌ No user found, redirecting to home");
          router.push("/");
          return;
        }

        console.log("✅ User found:", user.id);
        setCurrentUser(user);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("❌ Error fetching profile:", error);
          setProfile(null);
        } else if (data) {
          console.log("✅ Profile data:", data);
          
          // Check if profile is already complete
          if (data.username && data.full_name && data.bio) {
            console.log("✅ Profile already complete, redirecting...");
            router.push("/");
            return;
          }
          
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
      } catch (error) {
        console.error("❌ Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      console.log("🔍 Checking username availability:", username);
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      const available = !data || (currentUser && data.id === currentUser.id);
      console.log("✅ Username available:", available);
      setUsernameAvailable(available);
    } catch (error) {
      console.error("❌ Error checking username:", error);
      setUsernameAvailable(null);
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
    } else if (key === "bio") {
      // Limit bio to 500 characters
      const limitedValue = value.slice(0, 500);
      setFormData((prev) => ({ ...prev, [key]: limitedValue }));
      if (errors.bio) {
        setErrors((prev) => ({ ...prev, bio: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }));
      }
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate Username
    const cleanedUsername = slugifyUsername(formData.username);
    if (!cleanedUsername || cleanedUsername.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Validate Full Name
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    // Validate Bio (MANDATORY)
    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (formData.bio.trim().length < 10) {
      newErrors.bio = "Bio must be at least 10 characters";
    }

    // Validate URL format if link is provided (optional field)
    if (formData.link.trim()) {
      try {
        new URL(formData.link);
      } catch {
        newErrors.link = "Please enter a valid URL (e.g., https://example.com)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Starting form submission...");
    
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    // Check username availability
    if (usernameAvailable === false) {
      setErrors({ username: "Username is already taken" });
      console.log("❌ Username not available");
      return;
    }

    setSubmitting(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("❌ No user found during submission");
        setErrors({ _form: "Session expired. Please login again." });
        setSubmitting(false);
        router.push("/");
        return;
      }

      console.log("✅ User authenticated:", user.id);

      const cleanedUsername = slugifyUsername(formData.username);

      // Double-check username availability
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanedUsername)
        .maybeSingle();

      if (existing && existing.id !== user.id) {
        console.log("❌ Username already taken:", cleanedUsername);
        setErrors({ username: "Username already taken" });
        setSubmitting(false);
        return;
      }

      // Upload avatar if selected
      let avatar_url = profile?.avatar_url || "/default-avatar.webp";
      if (avatarFile) {
        console.log("📤 Uploading avatar...");
        const fileName = `${user.id}_${Date.now()}.webp`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`avatars/${fileName}`, avatarFile, { upsert: true });

        if (uploadError) {
          console.error("❌ Avatar upload error:", uploadError);
          setErrors({ avatar: "Failed to upload avatar. Please try again." });
          setSubmitting(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(`avatars/${fileName}`);

        avatar_url = publicData.publicUrl;
        console.log("✅ Avatar uploaded:", avatar_url);
      }

      // Prepare profile data
      const profileData = {
        id: user.id,
        username: cleanedUsername,
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim() || null,
        profession: formData.profession.trim() || null,
        link: formData.link.trim() || null,
        avatar_url,
        email: user.email,
      };

      console.log("💾 Saving profile data:", profileData);

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (updateError) {
        console.error("❌ Profile update error:", updateError);
        setErrors({ 
          _form: `Failed to save profile: ${updateError.message}` 
        });
        setSubmitting(false);
        return;
      }

      console.log("✅ Profile saved successfully:", updatedProfile);

      setShowSuccessPopup(true);

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);

    } catch (error: any) {
      console.error("❌ Unexpected error during submission:", error);
      setErrors({ 
        _form: `An unexpected error occurred: ${error.message || 'Please try again'}` 
      });
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
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className={styles.successPopup}>
          <div className={styles.successPopupContent}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
            </div>
            <h2 className={styles.successTitle}>Profile Completed!</h2>
            <p className={styles.successMessage}>
              Your profile has been saved successfully. Redirecting to home...
            </p>
            <div className={styles.successSpinner}></div>
          </div>
        </div>
      )}

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
                      usernameInputError || errors.username ? styles.inputError : ""
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
                  className={`${styles.input} ${errors.full_name ? styles.inputError : ""}`}
                />
                {errors.full_name && (
                  <p className={styles.errorText}>
                    {errors.full_name}
                  </p>
                )}
              </div>
            </div>

            {/* Bio - MANDATORY */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Bio *
              </label>
              <textarea
                placeholder="Tell us about yourself, your interests, or what you're passionate about... (minimum 10 characters)"
                value={formData.bio}
                onChange={(e) => onChange("bio", e.target.value)}
                required
                className={`${styles.textarea} ${errors.bio ? styles.inputError : ""}`}
                rows={4}
              />
              <div className={styles.bioFooter}>
                <p className={styles.helpText}>
                  {formData.bio.length}/500 characters
                </p>
                {errors.bio && (
                  <p className={styles.errorText}>
                    {errors.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Additional Information (Optional)</h2>
            
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

            {/* Website - Optional */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Website (Optional)
              </label>
              <input
                type="url"
                placeholder="https://your-website.com"
                value={formData.link}
                onChange={(e) => onChange("link", e.target.value)}
                className={`${styles.input} ${errors.link ? styles.inputError : ""}`}
              />
              {errors.link && (
                <p className={styles.errorText}>
                  {errors.link}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button
              type="submit"
              disabled={submitting || usernameAvailable === false || checkingUsername}
              className={styles.submitButton}
            >
              {submitting ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Saving Profile...
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
              * Required fields • You can update your information later in profile settings
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}