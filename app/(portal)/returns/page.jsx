"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Returns</h1>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-[#6c63ff] px-4 py-2">
          Request a Return
        </button>
      </div>
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : returnsList.length === 0 ? (
        <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-10 text-center text-slate-400">
          <RotateCcw className="mx-auto mb-3" /> No returns yet. Use the button above to request one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1e1e2e] bg-[#13131a]">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr><th className="px-4 py-3">Return ID</th><th>Date</th><th>Order ID</th><th>Reason</th><th>Status</th></tr>
            </thead>
            <tbody>
              {returnsList.map((ret) => (
                <tr key={ret.return_id} className="border-t border-[#1e1e2e]">
                  <td className="px-4 py-3">{ret.display_id || ret.return_id.slice(0, 8)}</td>
                  <td>{formatDateIN(ret.return_date)}</td>
                  <td>{ret.order_id.slice(0, 8)}</td>
                  <td>{ret.return_reason}</td>
                  <td><StatusBadge status={ret.approval_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal ? (
        <ReturnModal orders={deliveredOrders} onSubmit={onSubmit} onClose={() => setShowModal(false)} />
      ) : null}
    </div>
  );
}
