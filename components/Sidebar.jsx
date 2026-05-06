"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, RotateCcw, Wallet, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/payments", label: "Pay", icon: Wallet },
  { href: "/account", label: "Account", icon: UserCircle2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { customer, logout } = useAuth();
  
  return (
    <>
      {/* DESKTOP/TABLET SIDEBAR */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[var(--sidebar-collapsed-width)] flex-col border-r border-[#1e1e2e] bg-[#0f0f18] transition-all duration-300 md:flex lg:w-[var(--sidebar-width)]">
        <div className="flex h-[var(--top-header-height)] items-center justify-center border-b border-[#1e1e2e] lg:justify-start lg:px-6 lg:py-4">
          <p className="hidden text-xl font-semibold text-white lg:block">Ezinix</p>
          <p className="text-xl font-bold text-[#6c63ff] lg:hidden">E</p>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto p-3 lg:p-4">
          <p className="hidden px-2 pb-2 text-xs font-medium text-slate-500 lg:block">CUSTOMER PORTAL</p>
          {nav.map((item) => {
            const ActiveIcon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center gap-3 rounded-xl p-3 transition-colors lg:justify-start lg:px-4 lg:py-2.5 ${
                  active
                    ? "bg-[#6c63ff]/10 text-[#6c63ff] lg:border-l-4 lg:border-[#6c63ff] lg:rounded-l-sm lg:pl-3"
                    : "text-slate-400 hover:bg-[#1a1a2e] hover:text-white"
                }`}
                title={item.label}
              >
                <ActiveIcon size={20} className={active ? "text-[#6c63ff]" : ""} />
                <span className="hidden font-medium lg:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#1e1e2e] p-3 lg:p-4">
          <Link href="/account" className="flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-sm font-semibold text-[#6c63ff]">
              {customer?.customer_name?.charAt(0) || "U"}
            </div>
            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate text-sm font-medium text-white">
                {customer?.customer_name || "Customer"}
              </p>
              <button onClick={logout} className="text-xs text-slate-500 hover:text-white">
                Log out
              </button>
            </div>
          </Link>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 grid h-[var(--bottom-nav-height)] grid-cols-4 border-t border-[#1e1e2e] bg-[#0f0f18] md:hidden">
        {nav.map((item) => {
          const ActiveIcon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-full flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] ${
                active ? "text-[#6c63ff]" : "text-[#94a3b8]"
              }`}
            >
              <ActiveIcon size={22} className={active ? "text-[#6c63ff]" : ""} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
