import { config } from "./src/proxy";

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

/**
 * Converts a Next.js matcher glob pattern like "/competitors/:path*"
 * into a standard regular expression for deterministic testing.
 */
function matcherPatternToRegExp(pattern: string): RegExp {
  // Convert ":path*" into "(?:/.*)?" to match "/route" and "/route/anything"
  const regexStr = "^" + pattern.replace("/:path*", "(?:/.*)?") + "$";
  return new RegExp(regexStr);
}

/**
 * Checks whether a given path matches any pattern in config.matcher.
 */
function isPathMatchedByProxy(pathname: string): boolean {
  const matchers = config.matcher;
  if (!matchers || !Array.isArray(matchers)) {
    return false;
  }

  return matchers.some((pattern) => {
    const regex = matcherPatternToRegExp(pattern);
    return regex.test(pathname);
  });
}

async function runProxyConfigTests() {
  console.log("--- Running Milestone 6.3 Proxy Config & Matcher Tests ---\n");

  // Verify exported config structure
  assert(Array.isArray(config.matcher), "config.matcher must be an array");
  console.log(`Exported config.matcher contains ${config.matcher.length} patterns.`);

  // Verify /datasets/:path* presence in config.matcher
  assert(
    config.matcher.includes("/datasets/:path*"),
    "config.matcher MUST include '/datasets/:path*'"
  );
  console.log("PASS: Verification of '/datasets/:path*' inclusion in config.matcher.");

  // Test 1: Public & Auth Routes -> MUST NOT be matched by proxy matcher
  const publicRoutes = [
    "/",
    "/login",
    "/register",
  ];

  for (const route of publicRoutes) {
    const matched = isPathMatchedByProxy(route);
    assertEqual(matched, false, `Public route '${route}' must NOT be matched by proxy`);
  }
  console.log("PASS: Public and auth routes remain excluded from proxy matcher.");

  // Test 2: API Routes -> MUST NOT be matched by proxy matcher (API boundary)
  const apiRoutes = [
    "/api/auth/session",
    "/api/auth/signin",
    "/api/v1/competitors",
    "/api/v1/datasets",
    "/api/v1/analytics/dashboard",
  ];

  for (const route of apiRoutes) {
    const matched = isPathMatchedByProxy(route);
    assertEqual(matched, false, `API route '${route}' must NOT be matched by proxy`);
  }
  console.log("PASS: API routes (/api/*) remain excluded from proxy matcher (API boundary preserved).");

  // Test 3: Protected Application Routes -> MUST be matched by proxy matcher
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/analytics",
    "/competitors",
    "/competitors/123",
    "/competitors/compare",
    "/datasets",
    "/datasets/new",
    "/datasets/test-dataset-id",
    "/reports",
    "/reports/history",
    "/repository",
    "/opportunities",
    "/sentiment",
    "/feature-gaps",
    "/complaints",
    "/data-collection",
    "/profile",
    "/settings",
    "/alerts",
    "/audit-logs",
    "/assistant",
    "/enterprise-overview",
  ];

  for (const route of protectedRoutes) {
    const matched = isPathMatchedByProxy(route);
    assertEqual(matched, true, `Protected route '${route}' MUST be matched by proxy`);
  }
  console.log("PASS: All 22 protected routes (including /datasets and nested /datasets/*) are matched by proxy matcher.");

  // Test 4: Verify zero /api matcher entries exist
  const hasApiMatcher = config.matcher.some((pattern) => pattern.startsWith("/api"));
  assertEqual(hasApiMatcher, false, "config.matcher must NOT contain any /api rules");
  console.log("PASS: Confirmed zero /api patterns in proxy matcher.");

  console.log("\nAll Milestone 6.3 Proxy Config tests passed successfully!");
}

runProxyConfigTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
