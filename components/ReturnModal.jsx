"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ReturnModal({ orders, onSubmit, onClose }) {
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 20) {
      setError("Reason must be at least 20 characters.");
      return;
    }
    setError("");
    setLoading(true);
    const ok = await onSubmit({ orderId, reason, notes });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity md:items-center pb-[var(--bottom-nav-height)] md:pb-0">
      {/* Overlay to click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Content - Bottom Sheet on mobile, Centered Modal on desktop */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[#13131a] p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 md:max-w-md md:rounded-2xl md:p-6 md:zoom-in-95">
        
        {/* Mobile handle bar */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#2e2e3e] md:hidden" />
        
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Request a Return</h3>
          <button 
            onClick={onClose} 
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#1e1e2e] text-slate-300 hover:bg-[#2e2e3e] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Select Order</label>
            <select
              required
              className="w-full min-h-[52px] rounded-xl border border-[#2e2e3e] bg-[#1e1e2e] px-4 py-3 text-white focus:border-[#6c63ff] focus:outline-none md:min-h-[44px]"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="" disabled>Select delivered order</option>
              {orders.map((order) => (
                <option key={order.order_id} value={order.order_id}>
                  {order.display_id}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Reason for Return</label>
            <textarea
              required
              minLength={20}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-[#2e2e3e] bg-[#1e1e2e] p-4 text-white placeholder-slate-500 focus:border-[#6c63ff] focus:outline-none md:p-3"
              placeholder="Please explain why you need to return this item (min 20 chars)..."
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Additional Notes <span className="text-slate-500">(Optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[80px] rounded-xl border border-[#2e2e3e] bg-[#1e1e2e] p-4 text-white placeholder-slate-500 focus:border-[#6c63ff] focus:outline-none md:p-3"
              placeholder="Any other details..."
            />
          </div>
          
          {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}
          
          <div className="pt-2">
            <button
              disabled={loading}
              className="flex w-full min-h-[52px] items-center justify-center rounded-xl bg-[#6c63ff] px-4 py-3 text-base font-semibold text-white transition-colors disabled:opacity-60 md:min-h-[44px] md:text-sm"
            >
              {loading ? "Submitting Request..." : "Submit Return Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
