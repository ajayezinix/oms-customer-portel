"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
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
  const [filterType, setFilterType] = useState("all"); // all, pending, delivered

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

  const filtered = useMemo(() => {
    let result = orders.filter((o) =>
      `${o.display_id} ${o.order_date}`.toLowerCase().includes(search.toLowerCase())
    );
    if (filterType === "pending") {
      result = result.filter(o => o.fulfillment_status !== "delivered");
    } else if (filterType === "delivered") {
      result = result.filter(o => o.fulfillment_status === "delivered");
    }
    return result;
  }, [orders, search, filterType]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="hidden md:block text-2xl font-semibold">Orders</h1>
        
        {/* Search and Filter */}
        <div className="sticky top-[var(--top-header-height)] z-10 -mx-4 bg-[#0a0a0f]/95 px-4 py-3 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 md:h-10 w-full rounded-xl border border-[#2e2e3e] bg-[#1e1e2e] pl-10 pr-4 text-white placeholder-slate-500 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff] transition-all"
            />
          </div>
          
          {/* Mobile Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar md:hidden">
            {["all", "pending", "delivered"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filterType === type 
                    ? "bg-[#6c63ff] text-white" 
                    : "bg-[#1e1e2e] text-slate-300 border border-[#2e2e3e]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Desktop Filter Dropdown (Simplified as tabs for now) */}
          <div className="hidden md:flex gap-2 bg-[#1e1e2e] p-1 rounded-lg border border-[#2e2e3e]">
            {["all", "pending", "delivered"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  filterType === type ? "bg-[#2e2e3e] text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={7} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e1e2e] bg-[#13131a] py-20 px-4 text-center">
          <div className="mb-4 rounded-full bg-[#1e1e2e] p-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No orders found</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm">
            We couldn&apos;t find any orders matching your current search or filter criteria.
          </p>
          {(search || filterType !== "all") && (
            <button 
              onClick={() => { setSearch(""); setFilterType("all"); }}
              className="mt-6 font-medium text-[#6c63ff] hover:text-[#5a52d5]"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile View: Card List */}
          <div className="grid gap-4 md:hidden">
            {filtered.map((o) => {
              const balance = Number(o.total_order_amount) - Number(o.payment_received || 0);
              return (
                <div 
                  key={o.order_id} 
                  onClick={() => setActiveOrder(o)}
                  className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 shadow-lg active:scale-[0.98] transition-transform"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{o.display_id}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateIN(o.order_date)} • {o.last_updated_by_name || o.created_by_name || "System"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-base">{formatCurrencyINR(o.total_order_amount)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex flex-wrap gap-2">
                    <StatusBadge status={o.payment_status} />
                    <StatusBadge status={o.fulfillment_status} />
                    <StatusBadge status={o.approval_status} />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-xl bg-[#1a1a2e]/50 p-3">
                    <span className="text-xs font-medium text-slate-400">Balance Due</span>
                    <span className={`text-sm font-bold ${balance > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {formatCurrencyINR(Math.max(0, balance))}
                    </span>
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
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Balance</th>
                    <th className="px-6 py-4 font-medium">Payment</th>
                    <th className="px-6 py-4 font-medium hidden lg:table-cell">Delivery</th>
                    <th className="px-6 py-4 font-medium">Fulfillment</th>
                    <th className="px-6 py-4 font-medium">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e2e]">
                  {filtered.map((o) => {
                    const balance = Number(o.total_order_amount) - Number(o.payment_received || 0);
                    return (
                      <tr 
                        key={o.order_id} 
                        onClick={() => setActiveOrder(o)}
                        className="hover:bg-[#1a1a2e]/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-medium text-white group-hover:text-[#6c63ff] transition-colors">{o.display_id}</td>
                        <td className="px-6 py-4 text-slate-300">{formatDateIN(o.order_date)}</td>
                        <td className="px-6 py-4 text-white font-medium">{formatCurrencyINR(o.total_order_amount)}</td>
                        <td className={`px-6 py-4 font-semibold ${balance > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          {formatCurrencyINR(Math.max(0, balance))}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={o.payment_status} /></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><StatusBadge status={deliveryMap[o.order_id] || "pending"} /></td>
                        <td className="px-6 py-4"><StatusBadge status={o.fulfillment_status} /></td>
                        <td className="px-6 py-4"><StatusBadge status={o.approval_status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <OrderDetailModal order={activeOrder} onClose={() => setActiveOrder(null)} />
    </div>
  );
}
