import {
  buildAuthenticatedContext,
  requireRole,
  AuthenticatedUserContext,
} from "./src/backend/shared/utils/auth-context";
import { Role } from "@prisma/client";

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(
      `${message} — Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`
    );
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log("--- Running Corrected Milestone 6.2 Auth Context Tests ---\n");

  // Test 1: Missing session -> authentication failure / HTTP 401
  {
    const res = buildAuthenticatedContext(null);
    assertEqual(res.success, false, "Test 1: success must be false");
    if (!res.success) {
      assertEqual(res.response.status, 401, "Test 1: status must be 401");
      const json = await res.response.json();
      assertEqual(json.success, false, "Test 1: json.success");
      assertEqual(json.error?.message, "Authentication required", "Test 1: error message");
    }
    console.log("PASS: Test 1 (Missing session -> HTTP 401)");
  }

  // Test 2: Missing session.user -> authentication failure / HTTP 401
  {
    const res = buildAuthenticatedContext({});
    assertEqual(res.success, false, "Test 2: success must be false");
    if (!res.success) {
      assertEqual(res.response.status, 401, "Test 2: status must be 401");
      const json = await res.response.json();
      assertEqual(json.error?.message, "Authentication required", "Test 2: error message");
    }
    console.log("PASS: Test 2 (Missing session.user -> HTTP 401)");
  }

  // Test 3: Session missing user.id -> authentication failure / HTTP 401
  {
    const res = buildAuthenticatedContext({
      user: { email: "noid@acme.com", orgId: "org-1", role: "ADMIN" },
    });
    assertEqual(res.success, false, "Test 3: success must be false");
    if (!res.success) {
      assertEqual(res.response.status, 401, "Test 3: status must be 401");
      const json = await res.response.json();
      assertEqual(json.error?.message, "Authentication required", "Test 3: error message");
    }
    console.log("PASS: Test 3 (Session missing user.id -> HTTP 401)");
  }

  // Test 4: Session missing user.orgId -> authentication failure / HTTP 401
  {
    const res = buildAuthenticatedContext({
      user: { id: "usr-1", email: "noorg@acme.com", role: "ADMIN" },
    });
    assertEqual(res.success, false, "Test 4: success must be false");
    if (!res.success) {
      assertEqual(res.response.status, 401, "Test 4: status must be 401");
      const json = await res.response.json();
      assertEqual(json.error?.message, "Authentication required", "Test 4: error message");
    }
    console.log("PASS: Test 4 (Session missing user.orgId -> HTTP 401)");
  }

  // Test 5: Session missing user.email -> authentication failure / HTTP 401
  {
    const res = buildAuthenticatedContext({
      user: { id: "usr-1", orgId: "org-1", role: "ADMIN" },
    });
    assertEqual(res.success, false, "Test 5: success must be false");
    if (!res.success) {
      assertEqual(res.response.status, 401, "Test 5: status must be 401");
      const json = await res.response.json();
      assertEqual(json.error?.message, "Authentication required", "Test 5: error message");
    }
    console.log("PASS: Test 5 (Session missing user.email -> HTTP 401)");
  }

  // Test 6: Missing/invalid role -> fails closed with HTTP 401
  {
    const resInvalidRole = buildAuthenticatedContext({
      user: { id: "usr-1", email: "badrole@acme.com", orgId: "org-1", role: "SUPER_ADMIN" },
    });
    assertEqual(resInvalidRole.success, false, "Test 6a: invalid role must fail closed");
    if (!resInvalidRole.success) {
      assertEqual(resInvalidRole.response.status, 401, "Test 6a: status must be 401");
      const json = await resInvalidRole.response.json();
      assertEqual(json.error?.message, "Authentication required", "Test 6a: error message");
    }

    const resMissingRole = buildAuthenticatedContext({
      user: { id: "usr-1", email: "norole@acme.com", orgId: "org-1" },
    });
    assertEqual(resMissingRole.success, false, "Test 6b: missing role must fail closed");
    if (!resMissingRole.success) {
      assertEqual(resMissingRole.response.status, 401, "Test 6b: status must be 401");
      const json = await resMissingRole.response.json();
      assertEqual(json.error?.message, "Authentication required", "Test 6b: error message");
    }
    console.log("PASS: Test 6 (Invalid/missing role fails closed -> HTTP 401)");
  }

  // Test 7: Valid ADMIN context
  {
    const res = buildAuthenticatedContext({
      user: {
        id: "usr-admin-1",
        email: "admin@acme.com",
        name: "Admin User",
        orgId: "org-acme-100",
        role: "ADMIN",
      },
    });
    assertEqual(res.success, true, "Test 7: success must be true");
    if (res.success) {
      assertEqual(res.context.userId, "usr-admin-1", "Test 7: userId");
      assertEqual(res.context.email, "admin@acme.com", "Test 7: email");
      assertEqual(res.context.name, "Admin User", "Test 7: name");
      assertEqual(res.context.orgId, "org-acme-100", "Test 7: orgId");
      assertEqual(res.context.role, Role.ADMIN, "Test 7: role ADMIN");
    }
    console.log("PASS: Test 7 (Valid ADMIN session returns correct context)");
  }

  // Test 8: Valid ANALYST context
  {
    const res = buildAuthenticatedContext({
      user: {
        id: "usr-analyst-1",
        email: "analyst@acme.com",
        name: "Analyst User",
        orgId: "org-acme-100",
        role: "ANALYST",
      },
    });
    assertEqual(res.success, true, "Test 8: success must be true");
    if (res.success) {
      assertEqual(res.context.role, Role.ANALYST, "Test 8: role ANALYST");
    }
    console.log("PASS: Test 8 (Valid ANALYST session returns correct context)");
  }

  // Test 9: Valid VIEWER context
  {
    const res = buildAuthenticatedContext({
      user: {
        id: "usr-viewer-1",
        email: "viewer@acme.com",
        name: "Viewer User",
        orgId: "org-acme-100",
        role: "VIEWER",
      },
    });
    assertEqual(res.success, true, "Test 9: success must be true");
    if (res.success) {
      assertEqual(res.context.role, Role.VIEWER, "Test 9: role VIEWER");
    }
    console.log("PASS: Test 9 (Valid VIEWER session returns correct context)");
  }

  // Test 10: orgId comes exclusively from authenticated session
  {
    const res = buildAuthenticatedContext({
      user: {
        id: "usr-tenant-1",
        email: "user@tenantA.com",
        orgId: "trusted-org-tenant-A",
        role: "ADMIN",
      },
    });
    assertEqual(res.success, true, "Test 10: success must be true");
    if (res.success) {
      assertEqual(
        res.context.orgId,
        "trusted-org-tenant-A",
        "Test 10: orgId matches session"
      );
    }
    console.log("PASS: Test 10 (Context orgId comes exclusively from authenticated session)");
  }

  // Test 11: requireRole allows permitted role
  {
    const adminContext: AuthenticatedUserContext = {
      userId: "usr-admin-1",
      email: "admin@acme.com",
      orgId: "org-acme-100",
      role: Role.ADMIN,
    };
    const errRes = requireRole(adminContext, [Role.ADMIN, Role.ANALYST]);
    assertEqual(errRes, null, "Test 11: should return null when allowed");
    console.log("PASS: Test 11 (requireRole allows permitted role)");
  }

  // Test 12: requireRole rejects forbidden role with 403
  {
    const viewerContext: AuthenticatedUserContext = {
      userId: "usr-viewer-1",
      email: "viewer@acme.com",
      orgId: "org-acme-100",
      role: Role.VIEWER,
    };
    const errRes = requireRole(viewerContext, [Role.ADMIN, Role.ANALYST]);
    assert(errRes !== null, "Test 12: should return response when forbidden");
    if (errRes) {
      assertEqual(errRes.status, 403, "Test 12: status must be 403");
      const json = await errRes.json();
      assertEqual(json.success, false, "Test 12: json.success");
      assert(
        json.error?.message?.includes("Forbidden"),
        "Test 12: error message must include Forbidden"
      );
    }
    console.log("PASS: Test 12 (requireRole rejects forbidden role with HTTP 403)");
  }

  console.log("\nAll 12 Auth Context tests passed successfully!");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
