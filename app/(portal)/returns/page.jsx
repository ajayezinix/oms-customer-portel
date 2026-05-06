"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatDateIN } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import ReturnModal from "@/components/ReturnModal";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function ReturnsPage() {
  const { customer, supabase } = useAuth();
  const [returnsList, setReturnsList] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!customer?.customer_id) return;
    setLoading(true);
    const [{ data: retData }, { data: ordData }] = await Promise.all([
      supabase
        .from("returns")
        .select("*")
        .eq("customer_id", customer.customer_id)
        .order("return_date", { ascending: false }),
      supabase
        .from("orders")
        .select("order_id,display_id")
        .eq("customer_id", customer.customer_id)
        .eq("fulfillment_status", "delivered"),
    ]);
    setReturnsList(retData ?? []);
    setDeliveredOrders(ordData ?? []);
    setLoading(false);
  }, [customer?.customer_id, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async ({ orderId, reason }) => {
    const { error } = await supabase.from("returns").insert({
      order_id: orderId,
      customer_id: customer.customer_id,
      return_date: new Date().toISOString().slice(0, 10),
      return_reason: reason,
      approval_status: "pending",
      created_by_name: customer.customer_name,
      last_updated_by_name: customer.customer_name,
      created_by_user_id: null,
    });
    if (error) {
      toast.error("Failed to submit return request.");
      return false;
    }
    toast.success("Return request submitted.");
    await loadData();
    return true;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-2xl font-semibold">Returns</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="hidden md:flex items-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-2 font-medium text-white hover:bg-[#5a52d5] transition-colors"
        >
          <Plus size={18} /> Request Return
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : returnsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e1e2e] bg-[#13131a] py-20 px-4 text-center">
          <div className="mb-4 rounded-full bg-[#1e1e2e] p-4">
            <RotateCcw size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No returns yet</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm">
            You haven't requested any returns. If you need to return an item, tap the button below.
          </p>
          <button 
            onClick={() => setShowModal(true)} 
            className="md:hidden mt-6 rounded-xl bg-[#6c63ff] px-6 py-3 font-medium text-white hover:bg-[#5a52d5]"
          >
            Request Return
          </button>
        </div>
      ) : (
        <>
          {/* Mobile View: Card List */}
          <div className="grid gap-4 md:hidden">
            {returnsList.map((ret) => (
              <div key={ret.return_id} className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 shadow-lg">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{ret.display_id || ret.return_id.slice(0, 8)}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ord: {ret.order_id.slice(0, 8)} • {formatDateIN(ret.return_date)}</p>
                  </div>
                  <StatusBadge status={ret.approval_status} />
                </div>
                <div className="rounded-xl bg-[#1a1a2e]/50 p-3">
                  <p className="text-xs font-medium text-slate-400 mb-1">Reason</p>
                  <p className="text-sm text-slate-300 line-clamp-3">{ret.return_reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#13131a] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0f0f18] text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Return ID</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium max-w-[300px]">Reason</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e2e]">
                  {returnsList.map((ret) => (
                    <tr key={ret.return_id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{ret.display_id || ret.return_id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-slate-300">{formatDateIN(ret.return_date)}</td>
                      <td className="px-6 py-4 text-slate-300 font-mono">{ret.order_id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-slate-300 max-w-[300px] truncate">{ret.return_reason}</td>
                      <td className="px-6 py-4"><StatusBadge status={ret.approval_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Mobile Floating Action Button */}
      {!loading && returnsList.length > 0 && (
        <div className="fixed bottom-[calc(var(--bottom-nav-height)+16px)] right-4 z-10 md:hidden">
          <button 
            onClick={() => setShowModal(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6c63ff] text-white shadow-[0_8px_30px_rgb(108,99,255,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      )}

      {showModal ? (
        <ReturnModal orders={deliveredOrders} onSubmit={onSubmit} onClose={() => setShowModal(false)} />
      ) : null}
    </div>
  );
}
