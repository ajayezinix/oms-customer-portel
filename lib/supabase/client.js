import { createBrowserClient } from "@supabase/ssr";

let client = null;

/* Recursive no-op proxy: handles any chain like supabase.auth.getSession() */
function createNoOpProxy() {
  return new Proxy(
    function () {},
    {
      get: (_t, _p) => createNoOpProxy(),
      apply: () => Promise.resolve({ data: null, error: null }),
    }
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* During build / prerender, env vars may be absent — return a
     no-op proxy so any chain (supabase.auth.getSession etc.) resolves safely */
  if (!url || !key) {
    return createNoOpProxy();
  }

  if (!client) {
    client = createBrowserClient(url, key);
  }
  return client;
}
