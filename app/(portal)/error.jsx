"use client";

export default function PortalError({ error, reset }) {
  return (
    <div className="rounded-xl border border-red-900 bg-[#13131a] p-6">
      <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-300">{error?.message || "Failed to fetch data."}</p>
      <button onClick={reset} className="mt-4 rounded-lg bg-[#6c63ff] px-4 py-2">
        Retry
      </button>
    </div>
  );
}
