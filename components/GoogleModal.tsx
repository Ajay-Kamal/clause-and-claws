import { useState } from "react";
import styles from "../styles/navbar.module.css";
import { useRouter } from "next/navigation";

interface GoogleModalProps {
  showModal: boolean;
  onClose: () => void;
  onSignIn: () => Promise<void>;
  isLoading: boolean;
  redirectPath?: string;
}

export default function GoogleModal({
  showModal,
  onClose,
  onSignIn,
  isLoading,
  redirectPath = "/",
}: GoogleModalProps) {
  const router = useRouter();

  const handleClose = () => {
    onClose();
    if (redirectPath) {
      router.push(redirectPath);
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
        className={styles.spinnerCircle}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className={styles.spinnerPath}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"
      />
    </svg>
  );

  if (!showModal) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Sign in to your account</h2>
          <button className={styles.modalCloseBtn} onClick={handleClose}>
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
          <p>Please sign in to continue.</p>

          <button
            onClick={onSignIn}
            disabled={isLoading}
            className={styles.modalGoogleBtn}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.googleIcon}
                >
                  <defs>
                    <linearGradient
                      id="google-gradient-1"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#4285F4" stopOpacity="1" />
                      <stop offset="25%" stopColor="#4285F4" stopOpacity="1" />
                      <stop offset="25%" stopColor="#34A853" stopOpacity="1" />
                      <stop offset="50%" stopColor="#34A853" stopOpacity="1" />
                      <stop offset="50%" stopColor="#FBBC05" stopOpacity="1" />
                      <stop offset="75%" stopColor="#FBBC05" stopOpacity="1" />
                      <stop offset="75%" stopColor="#EA4335" stopOpacity="1" />
                      <stop offset="100%" stopColor="#EA4335" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#google-gradient-1)"
                    d="M12 24c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12zM12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9c2.724 0 5.178 1.21 6.84 3.125l-2.125 2.125c-1.125-1.125-2.67-1.75-4.715-1.75-3.315 0-6 2.685-6 6s2.685 6 6 6c3.315 0 5.625-1.925 6-3.75h-6v-3h9c0.264 1.5 0.5 3 0.5 4.5 0 5.514-3.5 9-9.5 9z"
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
}
