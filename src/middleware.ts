import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js root middleware applying security headers to every response.
 * This runs on the Edge Runtime for all matched routes, adding
 * defense-in-depth HTTP headers that complement the per-route security
 * measures implemented in `src/middleware/security.ts`.
 */
export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  /* ---------- Security Headers ---------- */
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  /* ---------- Request ID for tracing ---------- */
  const requestId =
    request.headers.get("x-request-id") ?? crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  return response;
}

/** Apply middleware to all routes except static assets and internal Next.js paths. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
