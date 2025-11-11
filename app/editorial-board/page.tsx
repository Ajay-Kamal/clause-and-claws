"use client";

import { useEffect, useState } from "react";
import EditorialBoardCard from "../../components/EditorialBoardCard";
import styles from "../../styles/EditorialBoard.module.css";

interface Editor {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  editor_role?: string;
  institution?: string;
  editor_order?: number;
}

export default function EditorialBoardPage() {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchEditors();
  }, []);

  async function fetchEditors() {
    try {
      const response = await fetch("/api/editorial-board");
      const data = await response.json();
      setEditors(data);
    } catch (error) {
      console.error("Error fetching editorial board:", error);
    } finally {
      setLoading(false);
    }
  }

  const displayedEditors = showAll ? editors : editors.slice(0, 8);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading Editorial Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Our Distinguished Editorial Board</h1>
        <p className={styles.subtitle}>
          Comprising over {editors.length}+ esteemed academicians, research scholars, and legal professionals
          <br />
          who uphold the highest standards of academic integrity.
        </p>
      </div>

      {editors.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No editorial board members at this time.</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {displayedEditors.map((editor) => (
              <EditorialBoardCard key={editor.id} editor={editor} />
            ))}
          </div>

          {editors.length > 8 && (
            <div className={styles.showMoreContainer}>
              <button
                onClick={() => setShowAll(!showAll)}
                className={styles.showMoreButton}
              >
                {showAll ? "Show Less Members" : "Show More Members"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}