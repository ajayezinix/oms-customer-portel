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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="w-full p-4 pb-20 md:p-8 md:pb-8">{children}</main>
    </div>
  );
}
