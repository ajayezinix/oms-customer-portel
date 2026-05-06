import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  const cookieStore = cookies();

  return createServerClient(url, key, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // set can fail during RSC render
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // remove can fail during RSC render
        }
      },
    },
  });
}
