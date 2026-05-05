"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-6 text-white">
        <div className="w-full max-w-md rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
          <h2 className="text-xl font-semibold">Unexpected error</h2>
          <p className="mt-2 text-sm text-slate-400">{error?.message}</p>
          <button onClick={reset} className="mt-4 rounded-lg bg-[#6c63ff] px-4 py-2">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
