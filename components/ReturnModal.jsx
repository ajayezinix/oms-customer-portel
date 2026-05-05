"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ReturnModal({ orders, onSubmit, onClose }) {
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="fixed inset-0 z-40 bg-black/50">
      <div className="mx-auto mt-16 w-full max-w-xl rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Request a Return</h3>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-[#1e1e2e]">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            required
            className="w-full rounded-lg border border-[#2e2e3e] bg-[#1e1e2e] p-3"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          >
            <option value="">Select delivered order</option>
            {orders.map((order) => (
              <option key={order.order_id} value={order.order_id}>
                {order.display_id}
              </option>
            ))}
          </select>
          <textarea
            required
            minLength={20}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-[#2e2e3e] bg-[#1e1e2e] p-3"
            placeholder="Return reason"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#2e2e3e] bg-[#1e1e2e] p-3"
            placeholder="Additional notes (optional)"
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-[#6c63ff] px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Return"}
          </button>
        </form>
      </div>
    </div>
  );
}
