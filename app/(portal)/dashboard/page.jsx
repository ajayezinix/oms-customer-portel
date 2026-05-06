"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrencyINR, formatDateIN } from "@/lib/format";
import { LogOut } from "lucide-react";
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
      const outstanding = (orders ?? []).reduce(
        (sum, o) => sum + Math.max(0, Number(o.total_order_amount || 0) - Number(o.payment_received || 0)),
        0
      );
      setStats({
        totalOrders: orders?.length ?? 0,
        totalValue,
        outstanding,
        openReturns: (returns ?? []).filter((r) => r.approval_status === "pending").length,
      });
      setRecentOrders((orders ?? []).slice(0, 5));
      setLoading(false);
    };
    run();
  }, [customer?.customer_id, supabase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome back, {customer?.customer_name || "Customer"}</h1>
        <button onClick={logout} className="rounded-lg border border-[#1e1e2e] px-4 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <LogOut size={16} /> Logout
          </span>
        </button>
      </div>
      {loading || !stats ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card title="Total Orders" value={stats.totalOrders} />
          <Card title="Total Order Value" value={formatCurrencyINR(stats.totalValue)} />
          <Card title="Outstanding Balance" value={formatCurrencyINR(stats.outstanding)} />
          <Card title="Open Returns" value={stats.openReturns} />
        </div>
      )}
      <section className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-[#6c63ff]">
            View All Orders
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.order_id} className="border-t border-[#1e1e2e]">
                  <td className="py-3">{o.display_id}</td>
                  <td>{formatDateIN(o.order_date)}</td>
                  <td>{formatCurrencyINR(o.total_order_amount)}</td>
                  <td>
                    <StatusBadge status={o.payment_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <Link href="/orders" className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:bg-[#1a1a2e]">
          <h3 className="font-semibold">Orders</h3>
          <p className="mt-1 text-sm text-slate-400">Track all order statuses.</p>
        </Link>
        <Link href="/returns" className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:bg-[#1a1a2e]">
          <h3 className="font-semibold">Returns</h3>
          <p className="mt-1 text-sm text-slate-400">Submit and monitor return requests.</p>
        </Link>
        <Link href="/payments" className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:bg-[#1a1a2e]">
          <h3 className="font-semibold">Payments</h3>
          <p className="mt-1 text-sm text-slate-400">View payment and due breakdown.</p>
        </Link>
        <Link href="/account" className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-5 hover:bg-[#1a1a2e]">
          <h3 className="font-semibold">Account</h3>
          <p className="mt-1 text-sm text-slate-400">See profile and documents.</p>
        </Link>
      </section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
