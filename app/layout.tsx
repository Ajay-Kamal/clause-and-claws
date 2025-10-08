import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SessionProvider } from "@/components/SessionProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Clause and Claws",
  description: "Academic Law Journal Platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: { path?: string }) => {
          try {
            cookieStore.set({
              name,
              value,
              path: options?.path ?? "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          } catch {
            // ignore set errors in server component
          }
        },
        remove: (name: string, options?: { path?: string }) => {
          try {
            cookieStore.set({
              name,
              value: "",
              path: options?.path ?? "/",
              maxAge: 0,
            });
          } catch {
            // ignore delete errors in server component
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <SessionProvider initialSession={session}>
          <NavBar />
          <main
            style={{
              minHeight: "calc(100vh - 430px)", // Adjust 120px if your header+footer height is different
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
