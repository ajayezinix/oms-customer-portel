"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyINR, formatDateIN } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function PaymentsPage() {
  const { customer, supabase } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer?.customer_id) return;
    const run = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("order_id,display_id,order_date,total_order_amount,payment_received,payment_status")
        .eq("customer_id", customer.customer_id)
        .order("order_date", { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    };
    run();
  }, [customer?.customer_id, supabase]);

  const outstanding = useMemo(
    () =>
      orders.reduce(
        (sum, order) => sum + Math.max(0, Number(order.total_order_amount) - Number(order.payment_received || 0)),
        0
      ),
    [orders]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>
      <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
        <p className="text-slate-400">Total Outstanding</p>
        <p className="mt-2 text-2xl font-semibold">{formatCurrencyINR(outstanding)}</p>
      </div>
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1e1e2e] bg-[#13131a]">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-3">Order ID</th><th>Date</th><th>Total</th><th>Received</th><th>Balance Due</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const total = Number(o.total_order_amount || 0);
                const received = Number(o.payment_received || 0);
                const balance = Math.max(0, total - received);
                const style =
                  balance === 0 ? "" : received > 0 ? "border-l-4 border-amber-500" : "border-l-4 border-red-500";
                return (
                  <tr key={o.order_id} className={`border-t border-[#1e1e2e] ${style}`}>
                    <td className="px-4 py-3">{o.display_id}</td>
                    <td>{formatDateIN(o.order_date)}</td>
                    <td>{formatCurrencyINR(total)}</td>
                    <td>{formatCurrencyINR(received)}</td>
                    <td>{formatCurrencyINR(balance)}</td>
                    <td><StatusBadge status={o.payment_status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
