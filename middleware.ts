import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers }
          });
          supabaseResponse.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers }
          });
          supabaseResponse.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/provider") ||
    pathname.startsWith("/patient") ||
    pathname.startsWith("/patients") ||
    pathname.startsWith("/invitations") ||
    pathname === "/analytics";

  // 1. If not logged in and trying to access protected routes, send to login
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If logged in, check their role in the profiles table
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    const role = profile?.role;

    // Prevent Patient from accessing Provider routes
    if (
      role === "patient" &&
      (pathname.startsWith("/provider") ||
        pathname.startsWith("/patients") ||
        pathname.startsWith("/invitations"))
    ) {
      return NextResponse.redirect(new URL("/analytics", request.url));
    }

    // Prevent Provider from accessing Patient routes
    if (role === "provider" && (pathname === "/patient" || pathname.startsWith("/patient/"))) {
      return NextResponse.redirect(new URL("/patients", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
