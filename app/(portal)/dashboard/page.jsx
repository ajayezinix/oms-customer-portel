"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrencyINR, formatCurrencyShort, formatDateIN } from "@/lib/format";
import { LogOut, LayoutDashboard, TrendingUp, AlertCircle, RefreshCcw, ChevronRight, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function DashboardPage() {
  const { customer, supabase, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer?.customer_id) return;
    const run = async () => {
      setLoading(true);
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customer.customer_id)
        .order("order_date", { ascending: false });
      const { data: returns } = await supabase
        .from("returns")
        .select("return_id,approval_status")
        .eq("customer_id", customer.customer_id);
      const totalValue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_order_amount || 0), 0);
      const pending = (orders ?? []).reduce(
        (sum, o) => sum + Math.max(0, Number(o.total_order_amount || 0) - Number(o.payment_received || 0)),
        0
      );
      setStats({
        totalOrders: orders?.length ?? 0,
        totalValue,
        pending,
        openReturns: (returns ?? []).filter((r) => r.approval_status === "pending").length,
      });
      setRecentOrders((orders ?? []).slice(0, 5));
      setLoading(false);
    };
    run();
  }, [customer?.customer_id, supabase]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Hi, {customer?.customer_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1 truncate max-w-[300px] md:max-w-none">
            {customer?.company_name || "Welcome to your customer portal"}
          </p>
        </div>
        <button onClick={logout} className="hidden md:flex rounded-xl border border-[#1e1e2e] bg-[#13131a] px-4 py-2 text-sm font-medium hover:bg-[#1a1a2e] transition-colors items-center gap-2">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {loading || !stats ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-6">
          <Card 
            title="Pending" 
            value={formatCurrencyShort(stats.pending)} 
            icon={<AlertCircle size={20} className={stats.pending > 0 ? "text-rose-400" : "text-slate-400"} />} 
            href="/payments"
          />
          <Card 
            title="Orders" 
            value={stats.totalOrders} 
            icon={<LayoutDashboard size={20} className="text-[#6c63ff]" />} 
            href="/orders"
          />
          <Card 
            title="Total Value" 
            value={formatCurrencyShort(stats.totalValue)} 
            icon={<TrendingUp size={20} className="text-emerald-400" />} 
            href="/orders"
          />
          <Card 
            title="Returns Open" 
            value={stats.openReturns} 
            icon={<RefreshCcw size={20} className="text-amber-400" />} 
            href="/returns"
          />
        </div>
      )}

      {/* Recent Orders */}
      <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white md:text-lg">Recent Orders</h2>
          <Link href="/orders" className="flex items-center gap-1 text-sm font-medium text-[#6c63ff] hover:text-[#5a52d5]">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {/* Mobile View: Card List */}
        <div className="grid gap-3 md:hidden">
          {recentOrders.map((o) => {
            const isPending = Number(o.total_order_amount || 0) - Number(o.payment_received || 0) > 0;
            const dueAmount = Number(o.total_order_amount || 0) - Number(o.payment_received || 0);
            
            return (
              <Link key={o.order_id} href={`/orders`} className="block rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-4 active:bg-[#1a1a2e]">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold text-white text-lg">{o.display_id}</span>
                </div>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                  <span>{formatDateIN(o.order_date)}</span>
                  <span>•</span>
                  <span className="font-medium text-white">{formatCurrencyINR(o.total_order_amount)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <StatusBadge status={o.payment_status} />
                  <StatusBadge status={o.fulfillment_status} />
                </div>

                {isPending ? (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-2 text-xs font-medium text-rose-400 border border-rose-500/20">
                    <AlertCircle size={14} />
                    <span>Pay {formatCurrencyINR(dueAmount)}</span>
                  </div>
                ) : (
                  <Link 
                    href={`/orders?orderId=${o.order_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Download size={14} />
                    <span>Download Invoice</span>
                  </Link>
                )}
              </Link>
            );
          })}
          {recentOrders.length === 0 && !loading && (
            <p className="text-center text-sm text-slate-400 py-4">No recent orders found.</p>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0f0f18] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="rounded-l-lg px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="rounded-r-lg px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {recentOrders.map((o) => (
                <tr key={o.order_id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{o.display_id}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDateIN(o.order_date)}</td>
                  <td className="px-4 py-3 text-white">{formatCurrencyINR(o.total_order_amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.payment_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && !loading && (
            <p className="text-center text-sm text-slate-400 py-8">No recent orders found.</p>
          )}
        </div>
      </section>

      {/* Quick Links for Desktop */}
      <section className="hidden md:grid gap-4 md:grid-cols-4">
        <Link href="/orders" className="group rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:border-[#6c63ff]/50 hover:bg-[#1a1a2e] transition-all">
          <h3 className="font-semibold text-white group-hover:text-[#6c63ff]">Orders</h3>
          <p className="mt-1 text-xs text-slate-400">Track all order statuses and history.</p>
        </Link>
        <Link href="/returns" className="group rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:border-[#6c63ff]/50 hover:bg-[#1a1a2e] transition-all">
          <h3 className="font-semibold text-white group-hover:text-[#6c63ff]">Returns</h3>
          <p className="mt-1 text-xs text-slate-400">Submit and monitor return requests.</p>
        </Link>
        <Link href="/payments" className="group rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:border-[#6c63ff]/50 hover:bg-[#1a1a2e] transition-all">
          <h3 className="font-semibold text-white group-hover:text-[#6c63ff]">Payments</h3>
          <p className="mt-1 text-xs text-slate-400">View payment breakdown and dues.</p>
        </Link>
        <Link href="/account" className="group rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:border-[#6c63ff]/50 hover:bg-[#1a1a2e] transition-all">
          <h3 className="font-semibold text-white group-hover:text-[#6c63ff]">Account</h3>
          <p className="mt-1 text-xs text-slate-400">Manage profile and company details.</p>
        </Link>
      </section>
    </div>
  );
}

function Card({ title, value, icon, href }) {
  const content = (
    <div className="flex flex-col h-full justify-between rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-6 shadow-lg md:shadow-sm transition-all hover:border-[#6c63ff]/50 hover:bg-[#1a1a2e] group cursor-pointer">
      <div className="mb-2 md:mb-4 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 md:text-sm group-hover:text-slate-300 transition-colors">{title}</p>
        <div className="hidden md:block rounded-lg bg-[#1a1a2e] p-2 group-hover:bg-[#6c63ff]/10 transition-colors">{icon}</div>
      </div>
      <p className="text-xl font-bold text-white md:text-2xl lg:text-3xl">{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
