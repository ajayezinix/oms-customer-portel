"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const authDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = async (email) => {
    if (!email) return setCustomer(null);
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("email_address", email)
      .single();
    setCustomer(data ?? null);
  };

  useEffect(() => {
    if (authDisabled) {
      setSession({ user: { email: "demo@ezinix.local" } });
      setCustomer({
        customer_id: "00000000-0000-0000-0000-000000000000",
        customer_name: "Demo Customer",
        email_address: "demo@ezinix.local",
      });
      setLoading(false);
      return;
    }

    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      await loadCustomer(currentSession?.user?.email);
      setLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await loadCustomer(nextSession?.user?.email);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [authDisabled, router, supabase]);

  const logout = async () => {
    if (authDisabled) {
      router.push("/dashboard");
      return;
    }
    await supabase.auth.signOut();
    setCustomer(null);
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
