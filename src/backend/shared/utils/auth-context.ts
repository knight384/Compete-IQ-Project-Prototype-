import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/auth/auth-options";
import { Role } from "@prisma/client";
import { errorResponse } from "./api-response";
import { NextResponse } from "next/server";

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  name?: string | null;
  orgId: string;
  role: Role;
}

export type AuthenticatedRouteResult =
  | { success: true; context: AuthenticatedUserContext }
  | { success: false; response: NextResponse };

const VALID_ROLES = new Set<string>([Role.ADMIN, Role.ANALYST, Role.VIEWER]);

/**
 * Pure session-to-context validator and mapper.
 * Can be tested independently without requiring a Next.js request context.
 *
 * Enforces strict validation:
 * - session must be an object
 * - session.user must be an object
 * - user.id must be a non-empty string
 * - user.email must be a non-empty string
 * - user.orgId must be a non-empty string
 * - user.role must be a valid Role enum value ('ADMIN' | 'ANALYST' | 'VIEWER')
 */
export function buildAuthenticatedContext(session: unknown): AuthenticatedRouteResult {
  if (!session || typeof session !== "object") {
    return {
      success: false,
      response: errorResponse("Authentication required", 401),
    };
  }

  const s = session as Record<string, unknown>;
  if (!s.user || typeof s.user !== "object") {
    return {
      success: false,
      response: errorResponse("Authentication required", 401),
    };
  }

  const user = s.user as Record<string, unknown>;

  const userId = typeof user.id === "string" ? user.id.trim() : "";
  const email = typeof user.email === "string" ? user.email.trim() : "";
  const orgId = typeof user.orgId === "string" ? user.orgId.trim() : "";
  const roleStr = typeof user.role === "string" ? user.role.trim() : "";

  if (!userId || !email || !orgId || !roleStr || !VALID_ROLES.has(roleStr)) {
    return {
      success: false,
      response: errorResponse("Authentication required", 401),
    };
  }

  const name = typeof user.name === "string" && user.name.trim() !== "" ? user.name.trim() : null;

  return {
    success: true,
    context: {
      userId,
      email,
      name,
      orgId,
      role: roleStr as Role,
    },
  };
}

/**
 * Server-side session authentication helper for production API routes.
 * Resolves session from NextAuth using getServerSession(authOptions)
 * and returns the authenticated context or a 401 response.
 *
 * Tenant context (orgId) originates EXCLUSIVELY from verified session claims.
 */
export async function requireAuthenticatedContext(): Promise<AuthenticatedRouteResult> {
  const session = await getServerSession(authOptions);
  return buildAuthenticatedContext(session);
}

/**
 * Enforces role authorization.
 * Returns null if authorized, or an HTTP 403 response if forbidden.
 */
export function requireRole(
  context: AuthenticatedUserContext,
  allowedRoles: Role[]
): NextResponse | null {
  if (!allowedRoles.includes(context.role)) {
    return errorResponse(
      "Forbidden: Insufficient permissions for this operation",
      403
    );
  }
  return null;
}
