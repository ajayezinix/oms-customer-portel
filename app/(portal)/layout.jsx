"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalLayout({ children }) {
  const { loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, router, session]);

  if (loading) {
    return <div className="p-6 text-slate-400">Loading session...</div>;
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#0a0a0f]">
      <Sidebar />
      <main className="w-full px-4 pb-24 pt-4 md:p-8 md:pb-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
