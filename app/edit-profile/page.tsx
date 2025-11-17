"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "./ProfileEdit.module.css";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Convert image to WebP format
const convertImageToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image to WebP'));
            }
          },
          'image/webp',
          0.9 // Quality (0-1)
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export default function ProfileEdit() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [convertingImage, setConvertingImage] = useState(false);

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
          setProfile(data);
          setAvatarPreview(data.avatar_url || "/default-avatar.webp");
          setFormData({
            username: data.username || "",
            full_name: data.full_name || "",
            bio: data.bio || "",
            location: data.location || "",
            profession: data.profession || "",
            link: data.link || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("❌ Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const onChange = (key: string, value: string) => {
    if (key === "bio") {
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type - accept JPEG, JPG, PNG
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ 
        ...prev, 
        avatar: "File must be in JPEG, JPG, or PNG format" 
      }));
      return;
    }

    // Check file size (before conversion)
    if (file.size > 5 * 1024 * 1024) { // 5MB limit for original file
      setErrors((prev) => ({
        ...prev,
        avatar: "File size must be less than 5MB",
      }));
      return;
    }

    setConvertingImage(true);
    setErrors((prev) => ({ ...prev, avatar: "" }));

    try {
      console.log("🔄 Converting image to WebP...");
      
      // Convert to WebP
      const webpBlob = await convertImageToWebP(file);
      
      // Check converted file size
      if (webpBlob.size > 50 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Converted image is too large. Please use a smaller image.",
        }));
        setConvertingImage(false);
        return;
      }

      console.log("✅ Image converted to WebP successfully");
      setAvatarFile(webpBlob);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(webpBlob);
      
    } catch (error) {
      console.error("❌ Error converting image:", error);
      setErrors((prev) => ({ 
        ...prev, 
        avatar: "Failed to convert image. Please try another file." 
      }));
    } finally {
      setConvertingImage(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
    
    setErrors({});

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    setSubmitting(true);

    try {
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

      // Upload avatar if selected
      let avatar_url = profile?.avatar_url || "/default-avatar.webp";
      if (avatarFile) {
        console.log("📤 Uploading avatar...");
        const fileName = `${user.id}_${Date.now()}.webp`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`avatars/${fileName}`, avatarFile, { 
            upsert: true,
            contentType: 'image/webp'
          });

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

      // Prepare profile data (username excluded from update)
      const profileData = {
        id: user.id,
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim() || null,
        profession: formData.profession.trim() || null,
        link: formData.link.trim() || null,
        avatar_url,
      };

      console.log("💾 Saving profile data:", profileData);

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Profile update error:", updateError);
        setErrors({ 
          _form: `Failed to update profile: ${updateError.message}` 
        });
        setSubmitting(false);
        return;
      }

      console.log("✅ Profile updated successfully:", updatedProfile);

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
            <h2 className={styles.successTitle}>Profile Updated!</h2>
            <p className={styles.successMessage}>
              Your profile has been updated successfully. Redirecting...
            </p>
            <div className={styles.successSpinner}></div>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <h1 className={styles.title}>Edit Your Profile</h1>
          <p className={styles.subtitle}>
            Update your profile information and preferences
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
                      {convertingImage ? (
                        <div className={styles.miniSpinner}></div>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={styles.avatarUpload}>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleAvatarChange}
                      className={styles.fileInput}
                      id="avatar-upload"
                      disabled={convertingImage}
                    />
                    <label htmlFor="avatar-upload" className={styles.fileButton}>
                      {convertingImage ? (
                        <>
                          <div className={styles.miniSpinner}></div>
                          Converting...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Change Photo
                        </>
                      )}
                    </label>
                    {errors.avatar && (
                      <p className={styles.errorText}>
                        {errors.avatar}
                      </p>
                    )}
                    <p className={styles.helpText}>
                      JPEG, JPG, or PNG (max 5MB) • Auto-converted to WebP
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.fieldRow}>
              {/* Username - DISABLED */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Username
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputPrefix}>@</span>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className={`${styles.input} ${styles.inputWithPrefix} ${styles.inputDisabled}`}
                  />
                </div>
                <p className={styles.helpText}>
                  Username cannot be changed
                </p>
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
              disabled={submitting || convertingImage}
              className={styles.submitButton}
            >
              {submitting ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Updating Profile...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            <p className={styles.submitHelpText}>
              * Required fields
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}