"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyINR, formatDateIN } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import OrderDetailModal from "@/components/OrderDetailModal";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function OrdersPage() {
  const { customer, supabase } = useAuth();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryMap, setDeliveryMap] = useState({});

  useEffect(() => {
    if (!customer?.customer_id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customer.customer_id)
        .order("order_date", { ascending: false });
      const orderRows = data ?? [];
      setOrders(orderRows);
      if (orderRows.length > 0) {
        const { data: documents } = await supabase
          .from("order_documents")
          .select("order_id,document_category")
          .in(
            "order_id",
            orderRows.map((o) => o.order_id)
          )
          .eq("document_category", "delivery_label");
        const map = {};
        orderRows.forEach((order) => {
          map[order.order_id] = "pending";
        });
        (documents ?? []).forEach((doc) => {
          map[doc.order_id] = "uploaded";
        });
        setDeliveryMap(map);
      }
      setLoading(false);
    };
    load();
  }, [customer?.customer_id, supabase]);

  const filtered = useMemo(
    () =>
      orders.filter((o) =>
        `${o.display_id} ${o.order_date}`.toLowerCase().includes(search.toLowerCase())
      ),
    [orders, search]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          placeholder="Search by Order ID or date"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[#2e2e3e] bg-[#1e1e2e] py-2 pl-9 pr-3"
        />
      </div>
      {loading ? (
        <LoadingSkeleton rows={7} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1e1e2e] bg-[#13131a]">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-3">Order ID</th><th>Date</th><th>Amount</th><th>Received</th>
                <th>Balance Due</th><th>Payment</th><th>Delivery</th><th>Fulfillment</th><th>Approval</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const balance = Number(o.total_order_amount) - Number(o.payment_received || 0);
                return (
                  <tr key={o.order_id} className="border-t border-[#1e1e2e] hover:bg-[#1a1a2e]">
                    <td className="px-4 py-3">{o.display_id}</td>
                    <td>{formatDateIN(o.order_date)}</td>
                    <td>{formatCurrencyINR(o.total_order_amount)}</td>
                    <td>{formatCurrencyINR(o.payment_received)}</td>
                    <td>{formatCurrencyINR(balance)}</td>
                    <td><StatusBadge status={o.payment_status} /></td>
                    <td><StatusBadge status={deliveryMap[o.order_id] || "pending"} /></td>
                    <td><StatusBadge status={o.fulfillment_status} /></td>
                    <td><StatusBadge status={o.approval_status} /></td>
                    <td>
                      <button onClick={() => setActiveOrder(o)} className="text-[#6c63ff]">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <OrderDetailModal order={activeOrder} onClose={() => setActiveOrder(null)} />
    </div>
  );
}
