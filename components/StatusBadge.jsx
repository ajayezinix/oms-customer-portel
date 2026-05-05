const colorMap = {
  approved: "bg-[#14532d] text-[#22c55e]",
  complete: "bg-[#14532d] text-[#22c55e]",
  delivered: "bg-[#14532d] text-[#22c55e]",
  dispatched: "bg-[#14532d] text-[#22c55e]",
  pending: "bg-[#451a03] text-[#f59e0b]",
  token: "bg-[#1e3a5f] text-[#3b82f6]",
  uploaded: "bg-[#1e3a5f] text-[#3b82f6]",
  rejected: "bg-[#450a0a] text-[#ef4444]",
};

export default function StatusBadge({ status = "pending" }) {
  const normalized = String(status).toLowerCase();
  const cls = colorMap[normalized] || "bg-[#1e1e2e] text-slate-300";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${cls}`}>
      {String(status).replace("_", " ")}
    </span>
  );
}
