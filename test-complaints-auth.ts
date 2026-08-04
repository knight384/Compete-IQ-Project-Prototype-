import { prisma } from "@/backend/prisma/client";
import { Role, ComplaintSeverity, ComplaintTrend } from "@prisma/client";
import { complaintService } from "@/backend/modules/complaints/complaint.service";

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function runTests() {
  console.log("=== STARTING COMPLAINTS AUTH, SECURITY & ISOLATION INTEGRATION TEST ===\n");
  let passedCount = 0;

  let orgA: { id: string } | null = null;
  let orgB: { id: string } | null = null;
  let competitorA: { id: string } | null = null;
  let competitorB: { id: string } | null = null;
  let productA: { id: string } | null = null;
  let productB: { id: string } | null = null;

  try {
    const timestamp = Date.now();

    // 1. Setup Test Organizations
    orgA = await prisma.organization.create({
      data: { name: `Complaint Test Org A ${timestamp}` },
    });

    orgB = await prisma.organization.create({
      data: { name: `Complaint Test Org B ${timestamp}` },
    });

    // 2. Setup Competitors & Products
    competitorA = await prisma.competitor.create({
      data: {
        name: `Competitor A ${timestamp}`,
        logoText: "CA",
        logoColor: "blue",
        status: "Active",
        orgId: orgA.id,
      },
    });

    competitorB = await prisma.competitor.create({
      data: {
        name: `Competitor B ${timestamp}`,
        logoText: "CB",
        logoColor: "red",
        status: "Active",
        orgId: orgB.id,
      },
    });

    productA = await prisma.product.create({
      data: {
        name: `Product A ${timestamp}`,
        competitorId: competitorA.id,
      },
    });

    productB = await prisma.product.create({
      data: {
        name: `Product B ${timestamp}`,
        competitorId: competitorB.id,
      },
    });

    console.log("✓ Setup: Organizations, Competitors, and Products created successfully.");

    // TEST 1: Complaint Creation & orgId Security
    const complaint1 = await complaintService.createComplaint({
      text: "Integration takes too long",
      severity: ComplaintSeverity.HIGH,
      frequency: 24,
      trend: ComplaintTrend.INCREASING,
      orgId: orgA.id,
      competitorId: competitorA.id,
      productId: productA.id,
    });

    await assert(complaint1.id !== undefined, "Complaint 1 created with ID");
    await assert(complaint1.orgId === orgA.id, "Complaint orgId bound to Org A");
    await assert(complaint1.frequency === 24, "Numeric frequency persisted accurately");
    passedCount++;
    console.log("✓ Test 1: Complaint creation & orgId security PASS");

    // TEST 2: Validation Enforcement (Frequency bounds & text requirement)
    let validationFailed = false;
    try {
      await complaintService.createComplaint({
        text: "",
        orgId: orgA.id,
      });
    } catch {
      validationFailed = true;
    }
    await assert(validationFailed, "Empty text creation rejected");

    validationFailed = false;
    try {
      await complaintService.createComplaint({
        text: "Bad Frequency Test",
        frequency: 150, // Invalid > 100
        orgId: orgA.id,
      });
    } catch {
      validationFailed = true;
    }
    await assert(validationFailed, "Frequency > 100 creation rejected");
    passedCount++;
    console.log("✓ Test 2: Validation enforcement (empty text & frequency bounds) PASS");

    // TEST 3: Multi-Tenant List Isolation
    const listA = await complaintService.listComplaints(orgA.id);
    const listB = await complaintService.listComplaints(orgB.id);

    await assert(listA.length === 1, "Org A lists 1 complaint");
    await assert(listB.length === 0, "Org B lists 0 complaints");
    passedCount++;
    console.log("✓ Test 3: Multi-tenant list scoping PASS");

    // TEST 4: Tenant-Hidden 404 Lookup Isolation
    const crossLookup = await complaintService.getComplaint(complaint1.id, orgB.id);
    await assert(crossLookup === null, "Org B lookup of Org A complaint returns null (404)");
    passedCount++;
    console.log("✓ Test 4: Tenant-hidden 404 lookup isolation PASS");

    // TEST 5: Foreign Competitor & Product Attachment Rejection
    let foreignAttachmentFailed = false;
    try {
      await complaintService.createComplaint({
        text: "Spoofed Competitor Test",
        orgId: orgA.id,
        competitorId: competitorB.id, // Org B competitor attached to Org A complaint
      });
    } catch {
      foreignAttachmentFailed = true;
    }
    await assert(foreignAttachmentFailed, "Foreign competitor attachment rejected");

    foreignAttachmentFailed = false;
    try {
      await complaintService.createComplaint({
        text: "Spoofed Product Test",
        orgId: orgA.id,
        productId: productB.id, // Org B product attached to Org A complaint
      });
    } catch {
      foreignAttachmentFailed = true;
    }
    await assert(foreignAttachmentFailed, "Foreign product attachment rejected");
    passedCount++;
    console.log("✓ Test 5: Foreign competitor/product attachment rejection PASS");

    // TEST 6: Inconsistent Product-Competitor Relationship Rejection
    let mismatchFailed = false;
    try {
      await complaintService.createComplaint({
        text: "Mismatched Parent Test",
        orgId: orgA.id,
        competitorId: competitorA.id,
        productId: productB.id, // Product B belongs to Competitor B
      });
    } catch {
      mismatchFailed = true;
    }
    await assert(mismatchFailed, "Mismatched product-competitor attachment rejected");
    passedCount++;
    console.log("✓ Test 6: Inconsistent product-competitor relationship rejection PASS");

    // TEST 7: Complaint Update Security & Scoping
    const updated = await complaintService.updateComplaint(complaint1.id, orgA.id, {
      text: "Updated integration complaint",
      frequency: 30,
    });
    await assert(updated?.text === "Updated integration complaint", "Text updated successfully");
    await assert(updated?.frequency === 30, "Frequency updated successfully");

    const crossUpdate = await complaintService.updateComplaint(complaint1.id, orgB.id, {
      text: "Hacked Text",
    });
    await assert(crossUpdate === null, "Org B update on Org A complaint blocked (404)");
    passedCount++;
    console.log("✓ Test 7: Complaint update tenant protection PASS");

    // TEST 8: Complaint Deletion Security & Scoping
    const crossDelete = await complaintService.deleteComplaint(complaint1.id, orgB.id);
    await assert(crossDelete === null, "Org B deletion of Org A complaint blocked (404)");

    const deleted = await complaintService.deleteComplaint(complaint1.id, orgA.id);
    await assert(deleted !== null, "Org A deleted own complaint successfully");

    const listAfterDelete = await complaintService.listComplaints(orgA.id);
    await assert(listAfterDelete.length === 0, "Org A complaints list is empty after deletion");
    passedCount++;
    console.log("✓ Test 8: Complaint deletion tenant scoping PASS");

    console.log(`\n==================================================`);
    console.log(`ALL ${passedCount} COMPLAINTS INTEGRATION ASSERTIONS PASSED!`);
    console.log(`==================================================\n`);
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  } finally {
    // Cleanup
    if (productA) await prisma.product.delete({ where: { id: productA.id } }).catch(() => {});
    if (productB) await prisma.product.delete({ where: { id: productB.id } }).catch(() => {});
    if (competitorA) await prisma.competitor.delete({ where: { id: competitorA.id } }).catch(() => {});
    if (competitorB) await prisma.competitor.delete({ where: { id: competitorB.id } }).catch(() => {});
    if (orgA) await prisma.organization.delete({ where: { id: orgA.id } }).catch(() => {});
    if (orgB) await prisma.organization.delete({ where: { id: orgB.id } }).catch(() => {});
    console.log("✓ Cleanup: Isolated test records removed cleanly.");
  }
}

runTests();
