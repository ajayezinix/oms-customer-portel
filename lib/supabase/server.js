import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
