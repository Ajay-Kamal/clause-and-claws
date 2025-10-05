"use client";
// SessionProvider.tsx

import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useState, useEffect } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

const SessionContext = createContext<
  | {
      session: Session | null;
      supabase: SupabaseClient;
    }
  | undefined
>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

export function SessionProvider({
  children,
  initialSession,
}: SessionProviderProps) {
  const [supabaseClient] = useState(() =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )
);

  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
  // Only fetch if we don’t already have a session
  if (!session) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {  
      setSession(session);
    });
  }

  const {
    data: { subscription },
  } = supabaseClient.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, [supabaseClient]);


  return (
    <SessionContext.Provider value={{ session, supabase: supabaseClient }}>
      {children}
    </SessionContext.Provider>
  );
}

  export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
