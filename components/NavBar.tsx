"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import styles from "../styles/navbar.module.css";

export default function NavBar() {
  const pathname = usePathname();
  const { supabase } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [mobileUploadDropdownOpen, setMobileUploadDropdownOpen] =
    useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] =
    useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      setIsAdmin(Boolean(profile?.is_admin));
      setProfileUsername(profile?.username || null);
    })();
  }, []);


  const isActive = (href: string) =>
    `${styles["nav-link"]} ${pathname === href ? styles.active : ""}`;

  const isUploadActive = () =>
    `${styles["nav-link"]} ${
      pathname.startsWith("/upload") ? styles.active : ""
    }`;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/articles", label: "Publications" },
    { href: "/authors", label: "Authors" },
    { href: "/tags", label: "Categories" },
    { href: "/about-us", label: "About Us" },
  ];

  const uploadOptions = [
    { href: "/upload", label: "Manuscript" }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUploadDropdownOpen(false);
      }

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setUser(null);
        return;
      }

      if (!session) {
        setUser(null);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Error refreshing session:", refreshError);
          await supabase.auth.signOut();
        }
        setUser(null);
      } else {
        setUser(user);
      }
    } catch (error) {
      console.error("Unexpected error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setShowGoogleModal(false);
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.refresh();
      } else if (event === "TOKEN_REFRESHED") {
        await fetchUser();
        router.refresh();
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleSignIn = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("Error signing in:", error);
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    setActionLoading(true);
    setProfileDropdownOpen(false);
    setMobileProfileDropdownOpen(false);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        setUser(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <svg
      className={styles.spinner}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="spinner-circle"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="spinner-path"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"
      />
    </svg>
  );

  const ChevronDownIcon = () => (
    <svg
      className={`${styles.chevron} ${
        uploadDropdownOpen ? styles.rotated : ""
      }`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const GoogleModal = () =>
    showGoogleModal && (
      <div
        className={styles.modalOverlay}
        onClick={() => setShowGoogleModal(false)}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>Sign in to your account</h2>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setShowGoogleModal(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          <div className={styles.modalBody}>
            <p>Welcome back! Please sign in to continue.</p>

            <button
              onClick={handleSignIn}
              disabled={actionLoading}
              className={styles.modalGoogleBtn}
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className={styles.googleIcon} viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <nav className={styles.navbar}>
      <div className={styles["navbar-container"]}>
        <div className={styles["navbar-inner"]}>
          <div className={styles["navbar-logo"]}>
            <Link href="/" className={styles.logo}>
              <img src="/images/logo-final.svg" alt="" />
            </Link>
          </div>

          <div className={styles["nav-desktop"]}>
            <div className={styles["nav-links"]}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  pathname === link.href ? styles.active : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            </div>
            {isAdmin ? (
              <Link
                href="/admin"
                className={`${styles.navlink} ${
                  pathname === "/admin" ? styles.active : ""
                }`}
              >
                Admin
              </Link>
            ) : (
              <div className={styles["nav-dropdown"]} ref={dropdownRef}>
                <button
                  onClick={() => setUploadDropdownOpen(!uploadDropdownOpen)}
                  onMouseEnter={() => setUploadDropdownOpen(true)}
                  className={isUploadActive()}
                >
                  Upload
                  <ChevronDownIcon />
                </button>

                {uploadDropdownOpen && (
                  <div
                    className={styles["dropdown-menu"]}
                    onMouseLeave={() => setUploadDropdownOpen(false)}
                  >
                    {uploadOptions.map((option) => (
                      <Link
                        key={option.href}
                        href={option.href}
                        className={
                          pathname === option.href
                            ? styles["dropdown-item"] + " " + styles.active
                            : styles["dropdown-item"]
                        }
                        onClick={() => setUploadDropdownOpen(false)}
                      >
                        {option.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles["auth-desktop"]}>
            {loading ? (
              <div className={styles["auth-loading"]}>
                <LoadingSpinner />
                <span>Loading...</span>
              </div>
            ) : user ? (
              <div
                className={styles["profile-dropdown"]}
                ref={profileDropdownRef}
              >
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  className={styles["profile-btn"]}
                >
                  <span className={styles["user-name"]}>
                    {user.email?.split("@")[0]}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div
                    className={styles["profile-dropdown-menu"]}
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <Link
                      href={'/authors/' + (profileUsername ? profileUsername : '')}
                      className={styles["profile-dropdown-item"]}
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <svg
                        className={styles["dropdown-icon"]}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      My Profile
                    </Link>

                    <button
                      onClick={handleSignOut}
                      disabled={actionLoading}
                      className={styles["profile-dropdown-item"]}
                    >
                      {actionLoading ? (
                        <>
                          <LoadingSpinner />
                          <span>Signing out...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className={styles["dropdown-icon"]}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign out
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowGoogleModal(true)}
                className={styles["btn-signin"]}
              >
                <svg
                  className={styles["google-icon-small"]}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Login with Google
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className={styles["mobile-toggle"]}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles["btn-menu"]}
            >
              <svg
                className={
                  mobileMenuOpen
                    ? styles["menu-icon"] + " " + styles.open
                    : styles["menu-icon"] + " " + styles.hidden
                }
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={
                  !mobileMenuOpen
                    ? styles["menu-icon"] + " " + styles.open
                    : styles["menu-icon"] + " " + styles.hidden
                }
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>

        {/* Mobile menu */}
        <div
          className={
            mobileMenuOpen
              ? styles["mobile-menu"] + " " + styles.open
              : styles["mobile-menu"]
          }
        >
          <div className={styles["mobile-inner"]}>
            <div>
              <button
                onClick={() =>
                  setMobileUploadDropdownOpen(!mobileUploadDropdownOpen)
                }
                className={isUploadActive()}
              >
                Upload
                <svg
                  className={
                    mobileUploadDropdownOpen
                      ? styles.chevron + " " + styles.rotated
                      : styles.chevron
                  }
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {mobileUploadDropdownOpen && (
                <div className={styles["mobile-dropdown"]}>
                  {uploadOptions.map((option) => (
                    <Link
                      key={option.href}
                      href={option.href}
                      className={
                        pathname === option.href
                          ? styles["dropdown-item"] + " " + styles.active
                          : styles["dropdown-item"]
                      }
                      onClick={() => {
                        setMobileUploadDropdownOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className={styles["mobile-auth"]}>
              {loading ? (
                <div className={styles["auth-loading"]}>
                  <LoadingSpinner />
                  <span>Loading...</span>
                </div>
              ) : user ? (
                <div className={styles["mobile-profile"]}>
                  <button
                    onClick={() =>
                      setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)
                    }
                    className={styles["mobile-profile-btn"]}
                  >
                    <div className={styles["profile-info"]}>
                      <div className={styles["user-avatar"]}>
                        <svg
                          className={styles["avatar-icon"]}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={styles["user-name"]}>
                        {user.email?.split("@")[0]}
                      </span>
                    </div>
                    <svg
                      className={
                        mobileProfileDropdownOpen
                          ? styles.chevron + " " + styles.rotated
                          : styles.chevron
                      }
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {mobileProfileDropdownOpen && (
                    <div className={styles["mobile-profile-dropdown"]}>
                      <Link
                        href="/profile/edit"
                        className={styles["profile-dropdown-item"]}
                        onClick={() => {
                          setMobileProfileDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <svg
                          className={styles["dropdown-icon"]}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Profile
                      </Link>

                      <button
                        onClick={handleSignOut}
                        disabled={actionLoading}
                        className={styles["profile-dropdown-item"]}
                      >
                        {actionLoading ? (
                          <>
                            <LoadingSpinner />
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className={styles["dropdown-icon"]}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign out
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowGoogleModal(true)}
                  className={styles["btn-signin"] + " " + styles.mobile}
                >
                  <svg
                    className={styles["google-icon-small"]}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Login with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <GoogleModal />
    </nav>
  );
}
