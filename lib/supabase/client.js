import { createBrowserClient } from "@supabase/ssr";

let client = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* During build / prerender, env vars may be absent — return a
     no-op placeholder so the module can load without crashing. */
  if (!url || !key) {
    return new Proxy(
      {},
      {
        get: () =>
          () =>
            Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      }
    );
  }

  if (!client) {
    client = createBrowserClient(url, key);
  }
  return client;
}
