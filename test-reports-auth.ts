import { prisma } from "@/backend/prisma/client";
import { Role, ReportSchedule } from "@prisma/client";
import { reportService } from "@/backend/modules/reports/report.service";

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function runTests() {
  console.log("=== STARTING REPORTS AUTH, SECURITY & EXECUTION INTEGRATION TEST ===\n");
  let passedCount = 0;

  let orgA: { id: string } | null = null;
  let orgB: { id: string } | null = null;
  let userAAdmin: { id: string } | null = null;
  let userAAnalyst: { id: string } | null = null;
  let userAViewer: { id: string } | null = null;
  let userBAdmin: { id: string } | null = null;

  try {
    const timestamp = Date.now();

    // 1. Setup Test Organizations
    orgA = await prisma.organization.create({
      data: { name: `Report Test Org A ${timestamp}` },
    });

    orgB = await prisma.organization.create({
      data: { name: `Report Test Org B ${timestamp}` },
    });

    // 2. Setup Test Users
    userAAdmin = await prisma.user.create({
      data: {
        email: `admin-a-${timestamp}@test.com`,
        passwordHash: "hash",
        name: "Org A Admin",
        role: Role.ADMIN,
        orgId: orgA.id,
      },
    });

    userAAnalyst = await prisma.user.create({
      data: {
        email: `analyst-a-${timestamp}@test.com`,
        passwordHash: "hash",
        name: "Org A Analyst",
        role: Role.ANALYST,
        orgId: orgA.id,
      },
    });

    userAViewer = await prisma.user.create({
      data: {
        email: `viewer-a-${timestamp}@test.com`,
        passwordHash: "hash",
        name: "Org A Viewer",
        role: Role.VIEWER,
        orgId: orgA.id,
      },
    });

    userBAdmin = await prisma.user.create({
      data: {
        email: `admin-b-${timestamp}@test.com`,
        passwordHash: "hash",
        name: "Org B Admin",
        role: Role.ADMIN,
        orgId: orgB.id,
      },
    });

    console.log("✓ Setup: Organizations and Users created successfully.");

    // TEST 1: Service level Report creation
    const report1 = await reportService.createReport({
      title: "Executive Summary Test",
      description: "Automated executive summary",
      schedule: ReportSchedule.WEEKLY,
      orgId: orgA.id,
      createdById: userAAdmin.id,
    });

    await assert(report1.id !== undefined, "Report 1 created with ID");
    await assert(report1.orgId === orgA.id, "Report 1 orgId bound to Org A");
    await assert(report1.createdById === userAAdmin.id, "Report 1 createdById bound to Admin A");
    passedCount++;
    console.log("✓ Test 1: Report creation with orgId & createdById validation PASS");

    // TEST 2: Multi-tenant list scoping
    const reportsA = await reportService.listReports(orgA.id);
    const reportsB = await reportService.listReports(orgB.id);

    await assert(reportsA.length === 1, "Org A lists 1 report");
    await assert(reportsB.length === 0, "Org B lists 0 reports");
    passedCount++;
    console.log("✓ Test 2: Multi-tenant report listing isolation PASS");

    // TEST 3: Tenant-hidden 404 lookup (Org B trying to get Org A report)
    const crossReportLookup = await reportService.getReport(report1.id, orgB.id);
    await assert(crossReportLookup === null, "Org B lookup of Org A report returns null (404)");
    passedCount++;
    console.log("✓ Test 3: Tenant-hidden 404 lookup isolation PASS");

    // TEST 4: Report Update validation & tenant protection
    const updatedReport = await reportService.updateReport(report1.id, orgA.id, {
      title: "Updated Executive Summary",
    });
    await assert(updatedReport?.title === "Updated Executive Summary", "Report title updated successfully");

    const crossUpdate = await reportService.updateReport(report1.id, orgB.id, {
      title: "Hacked Title",
    });
    await assert(crossUpdate === null, "Org B update on Org A report blocked (null/404)");
    passedCount++;
    console.log("✓ Test 4: Report update tenant protection PASS");

    // TEST 5: Report Execution & Live Analytics Snapshotting
    const executionResult = await reportService.executeReport(report1.id, orgA.id);
    await assert(executionResult !== null, "Execution result returned");
    await assert(executionResult?.status === "SUCCESS", "Execution completed with SUCCESS status");
    await assert(executionResult?.completedAt !== null, "Execution completedAt timestamp recorded");
    await assert(typeof executionResult?.durationSeconds === "number", "Duration dynamically derived as number");
    await assert(executionResult?.summary !== null, "Execution summary snapshot populated");
    passedCount++;
    console.log("✓ Test 5: Report execution engine & duration derivation PASS");

    // TEST 6: Execution History Tenant Scoping
    const historyA = await reportService.listExecutionHistory(orgA.id);
    const historyB = await reportService.listExecutionHistory(orgB.id);

    await assert(historyA.length === 1, "Org A history contains 1 execution record");
    await assert(historyA[0].reportId === report1.id, "History entry belongs to Report 1");
    await assert(historyB.length === 0, "Org B history is empty (isolated)");
    passedCount++;
    console.log("✓ Test 6: Report execution history multi-tenant isolation PASS");

    // TEST 7: Cross-tenant execution attempt
    const crossExecution = await reportService.executeReport(report1.id, orgB.id);
    await assert(crossExecution === null, "Org B execution of Org A report returns null (404)");
    passedCount++;
    console.log("✓ Test 7: Cross-tenant report execution block PASS");

    // TEST 8: Report Deletion & Cascade Verification
    const deletedReport = await reportService.deleteReport(report1.id, orgA.id);
    await assert(deletedReport !== null, "Report deleted successfully");

    const historyAfterDelete = await reportService.listExecutionHistory(orgA.id);
    await assert(historyAfterDelete.length === 0, "Executions cascaded and deleted");
    passedCount++;
    console.log("✓ Test 8: Report deletion & execution cascade PASS");

    console.log(`\n==================================================`);
    console.log(`ALL ${passedCount} REPORTS INTEGRATION ASSERTIONS PASSED!`);
    console.log(`==================================================\n`);
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  } finally {
    // Cleanup
    if (orgA) {
      await prisma.organization.delete({ where: { id: orgA.id } }).catch(() => {});
    }
    if (orgB) {
      await prisma.organization.delete({ where: { id: orgB.id } }).catch(() => {});
    }
    console.log("✓ Cleanup: Isolated test records removed cleanly.");
  }
}

runTests();
