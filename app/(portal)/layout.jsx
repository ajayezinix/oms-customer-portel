"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import Link from "next/link";

export default function PortalLayout({ children }) {
  const { loading, session, customer } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, router, session]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6c63ff] border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/orders")) return "Orders";
    if (pathname.startsWith("/returns")) return "Returns";
    if (pathname.startsWith("/payments")) return "Payments";
    if (pathname.startsWith("/account")) return "Account";
    return "Portal";
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#0a0a0f] overflow-x-hidden w-full">
      <Sidebar />
      
      {/* Main Content Wrapper */}
      <div className="flex w-full flex-col md:ml-[var(--sidebar-collapsed-width)] lg:ml-[var(--sidebar-width)] transition-all duration-300">
        
        {/* FIXED HEADER (Desktop Only) */}
        <header className="fixed top-0 z-20 hidden md:flex h-[var(--top-header-height)] w-full items-center justify-between border-b border-[#1e1e2e] bg-[#0f0f18] px-4 md:w-[calc(100%-var(--sidebar-collapsed-width))] lg:w-[calc(100%-var(--sidebar-width))] lg:px-8">
          <h1 className="text-lg font-semibold text-white md:text-xl relative z-10">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-4 relative z-10">
            <button className="relative flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full hover:bg-[#1a1a2e]">
              <Bell size={20} className="text-slate-300" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <Link href="/account" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c63ff] text-sm font-semibold text-white">
              {customer?.customer_name?.charAt(0) || "U"}
            </Link>
          </div>
        </header>



        {/* PAGE CONTENT */}
        <main className="w-full flex-1 px-4 pt-4 pb-[calc(var(--bottom-nav-height)+24px)] md:px-8 md:pt-[calc(var(--top-header-height)+32px)] md:pb-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
