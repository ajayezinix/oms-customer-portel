"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="hidden md:block text-2xl font-semibold">Payments</h1>
        
        {/* Outstanding Summary Card */}
        {!loading && (
          <div className="flex items-center justify-between rounded-2xl border border-[#1e1e2e] bg-gradient-to-r from-[#13131a] to-[#1a1a2e] p-5 shadow-lg w-full md:w-auto md:min-w-[300px]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Outstanding</p>
              <p className={`mt-1 text-2xl md:text-3xl font-bold ${outstanding > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {formatCurrencyINR(outstanding)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a0a0f] border border-[#2e2e3e]">
              <Wallet className={outstanding > 0 ? "text-rose-400" : "text-emerald-400"} size={24} />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : orders.length === 0 ? (
         <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e1e2e] bg-[#13131a] py-20 px-4 text-center">
          <div className="mb-4 rounded-full bg-[#1e1e2e] p-4">
            <Wallet size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No payment history</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm">
            You don't have any orders with payment records yet.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View: Card List */}
          <div className="grid gap-4 md:hidden">
            {orders.map((o) => {
              const total = Number(o.total_order_amount || 0);
              const received = Number(o.payment_received || 0);
              const balance = Math.max(0, total - received);
              const isPaid = balance === 0;
              const hasPartial = !isPaid && received > 0;
              
              return (
                <div 
                  key={o.order_id} 
                  className={`relative overflow-hidden rounded-2xl border bg-[#13131a] p-4 shadow-lg ${
                    isPaid ? "border-[#1e1e2e]" : hasPartial ? "border-amber-500/30" : "border-rose-500/30"
                  }`}
                >
                  {/* Color accent bar on the left */}
                  <div className={`absolute left-0 top-0 h-full w-1 ${
                    isPaid ? "bg-transparent" : hasPartial ? "bg-amber-500" : "bg-rose-500"
                  }`} />
                  
                  <div className="mb-3 flex items-start justify-between pl-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{o.display_id}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateIN(o.order_date)}</p>
                    </div>
                    <StatusBadge status={o.payment_status} />
                  </div>
                  
                  <div className="pl-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total</span>
                      <span className="font-medium text-white">{formatCurrencyINR(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Received</span>
                      <span className="font-medium text-emerald-400">{formatCurrencyINR(received)}</span>
                    </div>
                    <div className="my-2 h-px w-full bg-[#1e1e2e]" />
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-300">Balance Due</span>
                      <span className={`text-base font-bold ${balance > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {formatCurrencyINR(balance)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#13131a] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0f0f18] text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Received</th>
                    <th className="px-6 py-4 font-medium">Balance Due</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e2e]">
                  {orders.map((o) => {
                    const total = Number(o.total_order_amount || 0);
                    const received = Number(o.payment_received || 0);
                    const balance = Math.max(0, total - received);
                    const isPaid = balance === 0;
                    const hasPartial = !isPaid && received > 0;
                    
                    return (
                      <tr 
                        key={o.order_id} 
                        className={`hover:bg-[#1a1a2e]/50 transition-colors relative ${
                          isPaid ? "" : hasPartial ? "bg-amber-500/5" : "bg-rose-500/5"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-white relative">
                          {/* Color accent bar for unpaid items */}
                          {!isPaid && (
                            <div className={`absolute left-0 top-0 h-full w-1 ${
                              hasPartial ? "bg-amber-500" : "bg-rose-500"
                            }`} />
                          )}
                          {o.display_id}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{formatDateIN(o.order_date)}</td>
                        <td className="px-6 py-4 text-white font-medium">{formatCurrencyINR(total)}</td>
                        <td className="px-6 py-4 text-emerald-400 font-medium">{formatCurrencyINR(received)}</td>
                        <td className={`px-6 py-4 font-bold ${balance > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          {formatCurrencyINR(balance)}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={o.payment_status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
