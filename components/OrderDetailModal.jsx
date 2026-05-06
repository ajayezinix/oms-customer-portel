"use client";

import { X, Clock3, FileText, CheckCircle2, User, Calendar, CreditCard } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrencyINR, formatDateIN } from "@/lib/format";
import { useEffect } from "react";

export default function OrderDetailModal({ order, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (order) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [order]);

  if (!order) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Overlay to click to close (desktop) */}
      <div className="absolute inset-0 hidden md:block" onClick={onClose} />
      
      <div className="relative flex h-full w-full flex-col bg-[#0a0a0f] md:max-w-[480px] md:border-l md:border-[#1e1e2e] md:bg-[#13131a] md:shadow-2xl overflow-y-auto animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        
        {/* Header - Fixed */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1e1e2e] bg-[#0f0f18] px-4 py-4 md:bg-[#13131a] md:px-6 md:py-5">
          <div>
            <h3 className="text-lg font-semibold text-white md:text-xl">Order {order.display_id}</h3>
            <p className="text-sm text-slate-400">{formatDateIN(order.order_date)}</p>
          </div>
          <button 
            onClick={onClose} 
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#1e1e2e] text-slate-300 hover:bg-[#2e2e3e] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 p-4 md:p-6 pb-24">
          
          {/* Status Section */}
          <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-5 shadow-lg md:shadow-sm">
            <h4 className="mb-3 text-sm font-medium text-slate-400">Order Status</h4>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Payment</span>
                <StatusBadge status={order.payment_status} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Fulfillment</span>
                <StatusBadge status={order.fulfillment_status} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Approval</span>
                <StatusBadge status={order.approval_status} />
              </div>
            </div>
          </section>

          {/* Amount Section */}
          <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-5 shadow-lg md:shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
              <CreditCard size={16} /> Payment Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Total Amount</span>
                <span className="font-medium text-white">{formatCurrencyINR(order.total_order_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Amount Received</span>
                <span className="font-medium text-emerald-400">{formatCurrencyINR(order.payment_received)}</span>
              </div>
              <div className="my-2 h-px w-full bg-[#1e1e2e]" />
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Balance Due</span>
                <span className={`text-lg font-bold ${
                  (Number(order.total_order_amount) - Number(order.payment_received || 0)) > 0 
                  ? "text-rose-400" 
                  : "text-emerald-400"
                }`}>
                  {formatCurrencyINR(Math.max(0, Number(order.total_order_amount) - Number(order.payment_received || 0)))}
                </span>
              </div>
            </div>
          </section>

          {/* Details Section */}
          <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-5 shadow-lg md:shadow-sm">
            <h4 className="mb-4 text-sm font-medium text-slate-400">Order Information</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 text-slate-500" size={16} />
                <div>
                  <p className="text-xs text-slate-500">Order Date</p>
                  <p className="text-sm font-medium text-slate-200">{formatDateIN(order.order_date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="mt-0.5 text-slate-500" size={16} />
                <div>
                  <p className="text-xs text-slate-500">Handled By</p>
                  <p className="text-sm font-medium text-slate-200">{order.last_updated_by_name || order.created_by_name || "System"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Documents Section */}
          <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-5 shadow-lg md:shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
              <FileText size={16} /> Documents
            </h4>
            {order.invoice_id ? (
              <a
                href={order.invoice_id}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-3 font-medium text-white transition-colors hover:bg-[#5a52d5] md:min-h-[40px] md:w-auto"
              >
                <FileText size={18} /> Download Invoice
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#2e2e3e] bg-[#1a1a2e]/50 p-4">
                <Clock3 size={20} className="text-slate-500" /> 
                <p className="text-sm text-slate-400">Invoice will be available once generated.</p>
              </div>
            )}
          </section>
          
        </div>
      </div>
    </div>
  );
}
