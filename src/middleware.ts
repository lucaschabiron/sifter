import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/db/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match only essential auth and protected routes
     * Exclude static files, images, and API routes that don't need auth
     */
    "/dashboard/:path*",
    "/settings/:path*",
    "/sifts/:path*",
    "/beta/:path*",
  ],
};
