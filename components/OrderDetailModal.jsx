"use client";

import { useEffect, useState } from "react";
import { X, Clock3, FileText, CheckCircle2, User, Calendar, CreditCard, Search, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrencyINR, formatDateIN } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

export default function OrderDetailModal({ order, onClose }) {
  const [documents, setDocuments] = useState({ invoice: [], order_detail: [], payment_proof: [], delivery_label: [] });
  const [orderPayments, setOrderPayments] = useState([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [fetchingPayments, setFetchingPayments] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (order) {
      document.body.style.overflow = "hidden";
      
      const supabase = createClient();

      // Fetch all documents for this order
      const fetchDocs = async () => {
        if (!order.order_id) return;
        setFetchingDocs(true);
        const { data } = await supabase
          .from("order_documents")
          .select("file_url,file_name,document_category")
          .eq("order_id", order.order_id)
          .in("document_category", ["invoice", "order_detail", "payment_proof", "delivery_label"]);
        
        const sorted = { invoice: [], order_detail: [], payment_proof: [], delivery_label: [] };
        (data ?? []).forEach(doc => {
          if (sorted[doc.document_category]) {
            sorted[doc.document_category].push(doc);
          }
        });

        // Fallback for legacy invoice_id if no invoice doc found
        if (sorted.invoice.length === 0 && order.invoice_id?.startsWith("http")) {
          sorted.invoice.push({ file_url: order.invoice_id, file_name: "Invoice" });
        }

        setDocuments(sorted);
        setFetchingDocs(false);
      };

      // Fetch individual payments
      const fetchPayments = async () => {
        if (!order.order_id) return;
        setFetchingPayments(true);
        const { data } = await supabase
          .from("order_payments")
          .select("*, account:payment_accounts(account_name)")
          .eq("order_id", order.order_id)
          .order("created_at", { ascending: true });
        
        setOrderPayments(data || []);
        setFetchingPayments(false);
      };

      fetchDocs();
      fetchPayments();
    } else {
      document.body.style.overflow = "";
      setDocuments({ invoice: [], order_detail: [], payment_proof: [], delivery_label: [] });
      setOrderPayments([]);
      setShowPaymentDetails(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [order]);

  if (!order) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity md:items-center pb-[var(--bottom-nav-height)] md:pb-0">
      {/* Overlay to click to close (desktop) */}
      <div className="absolute inset-0 hidden md:block" onClick={onClose} />
      
      <div className="relative flex h-[calc(100%-var(--bottom-nav-height))] w-full flex-col bg-[#0a0a0f] md:h-full md:max-w-[480px] md:border-l md:border-[#1e1e2e] md:bg-[#13131a] md:shadow-2xl overflow-y-auto animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        
        {/* Header - Fixed */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1e1e2e] bg-[#0f0f18] px-4 py-4 md:bg-[#13131a] md:px-6 md:py-5">
          <div>
            <h3 className="text-lg font-semibold text-white md:text-xl">Order {order.display_id}</h3>
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
          
          {/* Status & Delivery Section */}
          <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-5 shadow-lg md:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-400">Order & Delivery Status</h4>
              <StatusBadge status={order.approval_status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#0a0a0f] p-3 border border-[#1e1e2e]">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Payment</p>
                <StatusBadge status={order.payment_status} />
              </div>
              <div className="rounded-xl bg-[#0a0a0f] p-3 border border-[#1e1e2e]">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Fulfillment</p>
                <StatusBadge status={order.fulfillment_status} />
              </div>
            </div>

            {/* Delivery Details Table */}
            <div className="mt-4 overflow-hidden rounded-xl border border-[#1e1e2e]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f0f18] text-slate-500 uppercase tracking-tighter">
                  <tr>
                    <th className="px-3 py-2 font-medium">Activity</th>
                    <th className="px-3 py-2 font-medium">Status/Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e2e] bg-[#0a0a0f]">
                  <tr>
                    <td className="px-3 py-2.5 text-slate-400">Current Status</td>
                    <td className="px-3 py-2.5 text-white font-medium capitalize">{order.fulfillment_status}</td>
                  </tr>
                  {order.fulfillment_status_updated_at && (
                    <tr>
                      <td className="px-3 py-2.5 text-slate-400">Last Updated</td>
                      <td className="px-3 py-2.5 text-white">{formatDateIN(order.fulfillment_status_updated_at)}</td>
                    </tr>
                  )}
                  {documents.delivery_label.length > 0 && (
                    <tr>
                      <td className="px-3 py-2.5 text-slate-400">Delivery Label</td>
                      <td className="px-3 py-2.5">
                        <a 
                          href={documents.delivery_label[0].file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#6c63ff] hover:underline font-medium"
                        >
                          View Label
                        </a>
                      </td>
                    </tr>
                  )}
                  {order.is_no_delivery && (
                    <tr>
                      <td className="px-3 py-2.5 text-slate-400">Delivery Type</td>
                      <td className="px-3 py-2.5 text-amber-400 font-medium">Self Pickup / No Delivery</td>
                    </tr>
                  )}
                  {order.is_walkin && (
                    <tr>
                      <td className="px-3 py-2.5 text-slate-400">Order Type</td>
                      <td className="px-3 py-2.5 text-blue-400 font-medium">Walk-in Order</td>
                    </tr>
                  )}
                  {order.notes && (
                    <tr>
                      <td className="px-3 py-2.5 text-slate-400">Order Notes</td>
                      <td className="px-3 py-2.5 text-slate-300 italic">&quot;{order.notes}&quot;</td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-3 py-2.5 text-slate-400">Order Date</td>
                    <td className="px-3 py-2.5 text-white font-medium">{formatDateIN(order.order_date)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 text-slate-400">Handled By</td>
                    <td className="px-3 py-2.5 text-white font-medium">{order.last_updated_by_name || order.created_by_name || "System"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Documents Section */}
          <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-4 md:p-5 shadow-lg md:shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
              <FileText size={16} /> Documents
            </h4>
            {fetchingDocs ? (
              <div className="flex items-center gap-3 rounded-xl border border-[#1e1e2e] bg-[#1a1a2e]/30 p-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#6c63ff] border-t-transparent"></div>
                <p className="text-sm text-slate-400">Locating documents...</p>
              </div>
            ) : (documents.invoice.length > 0 || documents.order_detail.length > 0) ? (
              <div className="grid gap-3">
                {/* Order Detail Files */}
                {documents.order_detail.map((doc, i) => (
                  <a
                    key={`detail-${i}`}
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    download={doc.file_name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-4 transition-all hover:bg-[#1a1a2e]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a2e] text-[#6c63ff]">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Order Detail File</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{doc.file_name}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#6c63ff] px-3 py-1.5 text-xs font-semibold text-white">
                      Download
                    </div>
                  </a>
                ))}

                {/* Invoices */}
                {documents.invoice.map((doc, i) => (
                  <a
                    key={`invoice-${i}`}
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    download={doc.file_name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#6c63ff]/20 bg-[#6c63ff]/5 p-4 transition-all hover:bg-[#6c63ff]/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Invoice</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{doc.file_name}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#6c63ff] px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20">
                      Download
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#2e2e3e] bg-[#1a1a2e]/50 p-4">
                <Clock3 size={20} className="text-slate-500" /> 
                <p className="text-sm text-slate-400">No documents available yet.</p>
              </div>
            )}
          </section>

          {/* Amount & Payment Card */}
          <section className="rounded-2xl border border-[#1e1e2e] bg-[#13131a] shadow-lg md:shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
              className="flex w-full items-center justify-between p-4 md:p-5 hover:bg-[#1a1a2e]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${showPaymentDetails ? "bg-[#6c63ff]/20 text-[#6c63ff]" : "bg-[#1e1e2e] text-slate-400"}`}>
                  <CreditCard size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white">Payment Summary</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Click to view details & proofs</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Balance Due</p>
                  <p className={`text-xs font-bold ${(Number(order.total_order_amount) - Number(order.payment_received || 0)) > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {formatCurrencyINR(Math.max(0, Number(order.total_order_amount) - Number(order.payment_received || 0)))}
                  </p>
                </div>
                {showPaymentDetails ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </div>
            </button>

            {showPaymentDetails && (
              <div className="border-t border-[#1e1e2e] bg-[#0a0a0f]/50 p-4 md:p-5 space-y-6 animate-in slide-in-from-top duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Amount</span>
                    <span className="font-medium text-white">{formatCurrencyINR(order.total_order_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Amount Received</span>
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

                {/* Payment Breakdown */}
                {(orderPayments.length > 0 || (order.utr_numbers && order.utr_numbers.length > 0) || documents.payment_proof.length > 0) && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Breakdown</h5>
                    
                    {/* Modern Split Payments */}
                    {orderPayments.length > 0 && (
                      <div className="space-y-2">
                        {orderPayments.map((p) => (
                          <div key={p.payment_id} className="rounded-xl bg-[#0a0a0f] p-3 border border-[#1e1e2e]">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">
                                  {p.is_cash ? "Cash" : p.account?.account_name || "Online"}
                                </span>
                                <span className="text-[10px] text-slate-500">{formatDateIN(p.created_at)}</span>
                              </div>
                              <span className="text-sm font-bold text-emerald-400">{formatCurrencyINR(p.amount)}</span>
                            </div>
                            {p.reference_number && (
                              <div className="mt-2 flex items-center gap-1.5 rounded bg-[#1a1a2e] px-2 py-1 border border-[#2e2e3e]">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">UTR:</span>
                                <span className="font-mono text-[11px] text-slate-300">{p.reference_number}</span>
                              </div>
                            )}
                            {p.surcharge_amount > 0 && (
                              <p className="mt-1 text-[10px] text-amber-500/80">
                                Includes {formatCurrencyINR(p.surcharge_amount)} processing fee
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Legacy UTR Numbers */}
                    {order.utr_numbers && order.utr_numbers.length > 0 && (
                      <div className="space-y-2">
                        {order.utr_numbers.map((utr, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-lg bg-[#0a0a0f] p-3 border border-dashed border-[#2e2e3e]">
                            <div className="h-2 w-2 rounded-full bg-[#6c63ff]" />
                            <span className="font-mono text-xs text-slate-300">{utr}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment Proof Screenshots */}
                    {documents.payment_proof.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-[#1e1e2e]" />
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Verification Images</p>
                          <div className="h-px flex-1 bg-[#1e1e2e]" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {documents.payment_proof.map((doc, i) => (
                            <a 
                              key={i} 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] shadow-inner"
                            >
                              <img 
                                src={doc.file_url} 
                                alt={doc.file_name} 
                                className="h-full w-full object-cover opacity-70 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="rounded-full bg-white/20 p-2 backdrop-blur-md">
                                  <Search size={20} className="text-white" />
                                </div>
                                <span className="mt-2 text-[10px] font-bold text-white uppercase tracking-widest">Full Preview</span>
                              </div>
                              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 backdrop-blur-md">
                                <p className="text-[8px] text-white/80 truncate max-w-[100px]">{doc.file_name}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
          
        </div>
      </div>
    </div>
  );
}
