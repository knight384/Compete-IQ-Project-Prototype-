import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Protect any route starting with /dashboard, /competitors, /reports, etc.
      // But we can simplify by just protecting everything except public routes
      const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
      const isPublicRoute = req.nextUrl.pathname === "/";
      
      if (isAuthRoute || isPublicRoute) {
        return true;
      }
      
      return !!token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/competitors/:path*",
    "/reports/:path*",
    "/repository/:path*",
    "/datasets/:path*",
    "/opportunities/:path*",
    "/sentiment/:path*",
    "/feature-gaps/:path*",
    "/complaints/:path*",
    "/data-collection/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/alerts/:path*",
    "/audit-logs/:path*",
    "/assistant/:path*",
    "/enterprise-overview/:path*",
  ],
};
