import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* During build / prerender env vars may be absent — skip auth checks */
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data } = await supabase.auth.getSession();
  const session = data?.session ?? null;

  const pathname = request.nextUrl.pathname;
  const protectedRoutes = ["/dashboard", "/orders", "/returns", "/payments", "/account"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  /* Root "/" → redirect based on session */
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = session ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  /* Not logged in + protected route → /login */
  if (!session && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  /* Already logged in + on /login → /dashboard */
  if (session && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/orders/:path*",
    "/returns/:path*",
    "/payments/:path*",
    "/account/:path*",
    "/login",
  ],
};
