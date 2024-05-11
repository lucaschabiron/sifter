import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/db/middleware";
import { createClient } from "@/lib/db/server";

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (user && request.nextUrl.pathname === "/signup") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!user && request.nextUrl.pathname.startsWith("/settings")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!user && request.nextUrl.pathname.startsWith("/sifts")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!user && request.nextUrl.pathname.startsWith("/beta")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
