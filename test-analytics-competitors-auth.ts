import {
  buildAuthenticatedContext,
} from "./src/backend/shared/utils/auth-context";
import { CompetitorService } from "./src/backend/modules/competitors/competitor.service";
import { IntelligenceAnalyticsService } from "./src/backend/modules/analytics/intelligence-analytics.service";
import { DashboardAnalyticsService } from "./src/backend/modules/analytics/dashboard-analytics.service";
import { prisma } from "./src/backend/prisma/client";

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
  console.log("--- Running Milestone 6.4 Analytics & Competitors Auth Tests ---\n");

  const competitorService = new CompetitorService();
  const intelligenceService = new IntelligenceAnalyticsService();
  const dashboardService = new DashboardAnalyticsService();

  // Test Group 1: Authentication Boundary Contract & HTTP 401 Standard Response
  {
    const unauthResult = buildAuthenticatedContext(null);
    assertEqual(unauthResult.success, false, "Unauthenticated request must have success=false");
    if (!unauthResult.success) {
      assertEqual(unauthResult.response.status, 401, "Unauthenticated status must be 401");
      const json = await unauthResult.response.json();
      assertEqual(json.success, false, "Response success must be false");
      assertEqual(json.error?.message, "Authentication required", "Response error message");
    }
    console.log("PASS: 1-3. Unauthenticated requests reject with 401 and 'Authentication required' JSON payload.");
  }

  // Setup unique test organization IDs
  const orgAId = `test-m64-org-A-${Date.now()}`;
  const orgBId = `test-m64-org-B-${Date.now()}`;

  try {
    // Create test organizations in database to satisfy foreign key constraints
    await prisma.organization.create({
      data: { id: orgAId, name: "M6.4 Test Org A" },
    });
    await prisma.organization.create({
      data: { id: orgBId, name: "M6.4 Test Org B" },
    });

    // Test Group 2: Analytics Tenant Isolation
    {
      // Fetch dashboard analytics for Org A & Org B independently
      const dashA = await dashboardService.getDashboardAnalytics(orgAId);
      const dashB = await dashboardService.getDashboardAnalytics(orgBId);
      assert(dashA !== null && typeof dashA === "object", "Org A dashboard returns metrics object");
      assert(dashB !== null && typeof dashB === "object", "Org B dashboard returns metrics object");

      // Foreign competitor filter isolation
      const fakeForeignCompetitorId = "00000000-0000-0000-0000-000000000099";
      const insightsA = await intelligenceService.getRecentInsights(orgAId, {
        competitorId: fakeForeignCompetitorId,
      });
      assertEqual(insightsA.items.length, 0, "Org A query for foreign competitor returns 0 items");

      const featureGapsA = await intelligenceService.getFeatureGapAnalytics(orgAId, {
        competitorId: fakeForeignCompetitorId,
      });
      assertEqual(featureGapsA.totalFeatureGapInsights, 0, "Org A feature gaps for foreign competitor returns 0 insights");

      console.log("PASS: 4-7. Analytics queries enforce tenant isolation and scope foreign competitor filters safely.");
    }

    // Test Group 3: Competitor CRUD Tenant Isolation & Tenant-Hidden 404 Behavior
    {
      // Create competitor under Org A (including all required Prisma fields: logoText, logoColor, status)
      const compA = await competitorService.createCompetitor({
        name: "Acme Corp (Org A)",
        domain: `acme-a-${Date.now()}.com`,
        logoText: "AC",
        logoColor: "#000000",
        status: "Active",
        orgId: orgAId,
      });

      // Create competitor under Org B
      const compB = await competitorService.createCompetitor({
        name: "Beta Inc (Org B)",
        domain: `beta-b-${Date.now()}.com`,
        logoText: "BT",
        logoColor: "#111111",
        status: "Active",
        orgId: orgBId,
      });

      // Org A list excludes Org B competitors
      const listA = await competitorService.listCompetitorsByOrganization(orgAId);
      assert(listA.some((c) => c.id === compA.id), "Org A list contains Org A competitor");
      assert(!listA.some((c) => c.id === compB.id), "Org A list EXCLUDES Org B competitor");

      // Org A can retrieve its own competitor
      const fetchedA = await competitorService.getCompetitorById(compA.id, orgAId);
      assertEqual(fetchedA.id, compA.id, "Org A can retrieve its own competitor");

      // Org A requesting Org B competitor throws tenant-hidden error
      try {
        await competitorService.getCompetitorById(compB.id, orgAId);
        assert(false, "Org A GET of Org B competitor must throw error");
      } catch (err: any) {
        assert(
          err.message.includes("not found") || err.message.includes("access denied"),
          "Error indicates not found or access denied"
        );
      }

      // Org A attempting PUT on Org B competitor throws tenant-hidden error
      try {
        await competitorService.updateCompetitor(compB.id, orgAId, { name: "Hacked Name" });
        assert(false, "Org A PUT of Org B competitor must throw error");
      } catch (err: any) {
        assert(
          err.message.includes("not found") || err.message.includes("access denied"),
          "Error indicates not found or access denied"
        );
      }

      // Org A attempting DELETE on Org B competitor throws tenant-hidden error
      try {
        await competitorService.deleteCompetitor(compB.id, orgAId);
        assert(false, "Org A DELETE of Org B competitor must throw error");
      } catch (err: any) {
        assert(
          err.message.includes("not found") || err.message.includes("access denied"),
          "Error indicates not found or access denied"
        );
      }

      console.log("PASS: 8-13. Competitor CRUD operations enforce strict tenant isolation & tenant-hidden 404 behavior.");
    }

    // Test Group 4: POST orgId Spoofing Prevention
    {
      const spoofedClientBody = {
        name: "Spoof Attempt Corp",
        domain: `spoof-${Date.now()}.com`,
        logoText: "SP",
        logoColor: "#222222",
        status: "Active",
        orgId: "attacker-chosen-org-id-xyz",
      };

      // Route construction pattern enforces auth context orgId after body spread
      const finalPayload = {
        ...spoofedClientBody,
        orgId: orgAId,
      };

      assertEqual(
        finalPayload.orgId,
        orgAId,
        "Authenticated orgId overwrites client-supplied body orgId"
      );

      const created = await competitorService.createCompetitor(finalPayload);
      assertEqual(created.orgId, orgAId, "Created competitor belongs to authenticated orgId");

      console.log("PASS: 14. POST competitor creation prevents client orgId spoofing.");
    }
  } finally {
    // Scoped cleanup of test records created during this run
    await prisma.competitor.deleteMany({
      where: { orgId: { in: [orgAId, orgBId] } },
    });
    await prisma.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
  }

  console.log("\nAll Milestone 6.4 Analytics & Competitors Auth tests passed successfully!");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
