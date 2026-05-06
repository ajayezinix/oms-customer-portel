"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = async (email) => {
    if (!email) { setCustomer(null); return; }
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("email_address", email)
      .single();
    setCustomer(data ?? null);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      console.log("AuthProvider: Starting init...");
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session ?? null;
        console.log("AuthProvider: Session fetched:", currentSession ? "Logged in" : "No session");
        
        if (mounted) {
          setSession(currentSession);
          setLoading(false);
          console.log("AuthProvider: Loading set to false");
          
          if (currentSession?.user?.email) {
            console.log("AuthProvider: Loading customer data...");
            loadCustomer(currentSession.user.email);
          }
        }
      } catch (err) {
        console.error("AuthProvider: Init error:", err);
        if (mounted) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        if (nextSession?.user?.email) {
          loadCustomer(nextSession.user.email);
        } else {
          setCustomer(null);
        }
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
    setSession(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ supabase, session, customer, loading, refreshCustomer: loadCustomer, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
