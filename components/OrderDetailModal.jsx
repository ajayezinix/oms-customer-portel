"use client";

import { X, Clock3 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrencyINR, formatDateIN } from "@/lib/format";

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/50">
      <div className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-[#1e1e2e] bg-[#13131a] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Order {order.display_id}</h3>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-[#1e1e2e]">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 text-sm text-slate-300">
          <p>Date: {formatDateIN(order.order_date)}</p>
          <p>Total: {formatCurrencyINR(order.total_order_amount)}</p>
          <p>Received: {formatCurrencyINR(order.payment_received)}</p>
          <p>Handled By: {order.last_updated_by_name || order.created_by_name || "-"}</p>
          <div className="flex gap-2">
            <StatusBadge status={order.payment_status} />
            <StatusBadge status={order.fulfillment_status} />
            <StatusBadge status={order.approval_status} />
          </div>
          {order.invoice_id ? (
            <a
              href={order.invoice_id}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-[#6c63ff] px-4 py-2 text-white"
            >
              Download Invoice
            </a>
          ) : (
            <p className="flex items-center gap-2 text-slate-400">
              <Clock3 size={16} /> Invoice not uploaded yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
