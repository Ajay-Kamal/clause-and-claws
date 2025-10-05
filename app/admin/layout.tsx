"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import styles from "../../styles/AdminLayout.module.css";

const navItems = [
  { label: "Pending", href: "/admin" },
  { label: "Approved", href: "/admin/approved" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Published", href: "/admin/published" },
  { label: "Rejected", href: "/admin/rejected" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      setIsAdmin(Boolean(profile?.is_admin));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}>Checking admin access...</div>;
  }
  
  if (!isAdmin) {
    return <div className={styles.accessDenied}>Access denied — admins only.</div>;
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        <nav className={styles.navigation}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href ? styles.navItemActive : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <div className={styles.contentWrapper}>{children}</div>
      </main>
    </div>
  );
}