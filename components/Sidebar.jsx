"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, RotateCcw, Wallet, UserCircle2 } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/returns", label: "Returns", icon: RotateCcw },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/account", label: "Account", icon: UserCircle2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-[#1e1e2e] bg-[#0f0f18] p-5">
        <p className="mb-8 text-xl font-semibold text-white">Ezinix OMS</p>
        <nav className="space-y-2">
          {nav.map((item) => {
            const ActiveIcon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                  active ? "bg-[#6c63ff] text-white" : "text-slate-300 hover:bg-[#1a1a2e]"
                }`}
              >
                <ActiveIcon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-[#1e1e2e] bg-[#0f0f18]/95 p-2 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {nav.map((item) => {
          const ActiveIcon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] ${
                active ? "bg-[#1f1f32] text-white" : "text-slate-400"
              }`}
            >
              <ActiveIcon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
