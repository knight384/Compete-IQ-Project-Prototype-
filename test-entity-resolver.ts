import { prisma } from './src/backend/prisma/client';
import { entityResolverService } from './src/backend/modules/competitors/entity-resolver.service';
import { normalizeEntityName, normalizeDomain } from './src/backend/shared/utils/normalize-entity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
  }
}

async function runTests() {
  console.log('--- Running Tenant-Safe Entity Resolver Tests ---\n');

  // Clean test databases for test orgs
  const orgAId = 'org-test-entity-resolver-a';
  const orgBId = 'org-test-entity-resolver-b';

  await prisma.product.deleteMany({
    where: { competitor: { orgId: { in: [orgAId, orgBId] } } },
  });
  await prisma.competitor.deleteMany({
    where: { orgId: { in: [orgAId, orgBId] } },
  });
  await prisma.organization.deleteMany({
    where: { id: { in: [orgAId, orgBId] } },
  });

  // Create Organizations
  await prisma.organization.create({
    data: { id: orgAId, name: 'Test Org A' },
  });
  await prisma.organization.create({
    data: { id: orgBId, name: 'Test Org B' },
  });

  // Create Competitors in Org A
  const compA1 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Acme Corp',
      domain: 'acme.com',
      logoText: 'AC',
      logoColor: '#000000',
      status: 'Active',
    },
  });

  const compA2 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Beta Systems',
      domain: 'beta.io',
      logoText: 'BS',
      logoColor: '#111111',
      status: 'Active',
    },
  });

  const compADup1 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Dup Name Corp',
      domain: 'dup1.com',
      logoText: 'D1',
      logoColor: '#222222',
      status: 'Active',
    },
  });

  const compADup2 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Dup Name Corp',
      domain: 'dup2.com',
      logoText: 'D2',
      logoColor: '#333333',
      status: 'Active',
    },
  });

  const compADomainDup1 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Shared Domain One',
      domain: 'shareddomain.com',
      logoText: 'SD1',
      logoColor: '#444444',
      status: 'Active',
    },
  });

  const compADomainDup2 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Shared Domain Two',
      domain: 'shareddomain.com',
      logoText: 'SD2',
      logoColor: '#555555',
      status: 'Active',
    },
  });

  const compAPunct1 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Acme, Inc.',
      domain: 'acmeinc.com',
      logoText: 'AI',
      logoColor: '#666666',
      status: 'Active',
    },
  });

  const compAPunct2 = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Acme Inc.',
      domain: 'acmeinc-nodot.com',
      logoText: 'AIN',
      logoColor: '#777777',
      status: 'Active',
    },
  });

  const compASubdomain = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'Subdomain Corp',
      domain: 'shop.acme.com',
      logoText: 'SC',
      logoColor: '#888888',
      status: 'Active',
    },
  });

  // Create Competitor in Org B with IDENTICAL name
  const compB1 = await prisma.competitor.create({
    data: {
      orgId: orgBId,
      name: 'Acme Corp',
      domain: 'acme.com',
      logoText: 'ACB',
      logoColor: '#999999',
      status: 'Active',
    },
  });

  // Create Products
  const prodA1 = await prisma.product.create({
    data: {
      name: 'CloudPro',
      competitorId: compA1.id,
      description: 'Pro Cloud Product',
    },
  });

  const prodA2 = await prisma.product.create({
    data: {
      name: 'CloudPro',
      competitorId: compA2.id,
      description: 'Pro Cloud Product under Beta',
    },
  });

  const prodB1 = await prisma.product.create({
    data: {
      name: 'CloudPro',
      competitorId: compB1.id,
      description: 'Org B CloudPro',
    },
  });

  console.log('Test setup completed.\n');

  // Test 1: Exact competitor name match
  const res1 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'Acme Corp' });
  assertEqual(res1.status, 'RESOLVED', 'Test 1 status');
  assertEqual(res1.competitorId, compA1.id, 'Test 1 competitorId');
  assertEqual(res1.matchStrategy, 'EXACT_NAME', 'Test 1 matchStrategy');

  // Test 2: Case normalization
  const res2 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'ACME CORP' });
  assertEqual(res2.status, 'RESOLVED', 'Test 2 status');
  assertEqual(res2.competitorId, compA1.id, 'Test 2 competitorId');

  // Test 3: Whitespace normalization
  const res3 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: '   Acme   Corp   ' });
  assertEqual(res3.status, 'RESOLVED', 'Test 3 status');
  assertEqual(res3.competitorId, compA1.id, 'Test 3 competitorId');

  // Test 4: Exact domain match
  const res4 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'acme.com' });
  // Note: Pass 1 checks name "acme.com" (0 matches), Pass 2 checks domain "acme.com" (compA1 matches)
  assertEqual(res4.status, 'RESOLVED', 'Test 4 status');
  assertEqual(res4.competitorId, compA1.id, 'Test 4 competitorId');
  assertEqual(res4.matchStrategy, 'EXACT_DOMAIN', 'Test 4 matchStrategy');

  // Test 5: URL domain normalization
  const res5 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'https://www.acme.com/about?ref=1' });
  assertEqual(res5.status, 'RESOLVED', 'Test 5 status');
  assertEqual(res5.competitorId, compA1.id, 'Test 5 competitorId');
  assertEqual(res5.matchStrategy, 'EXACT_DOMAIN', 'Test 5 matchStrategy');

  // Test 6: Duplicate competitor name ambiguity (fail-closed)
  const res6 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'Dup Name Corp' });
  assertEqual(res6.status, 'AMBIGUOUS', 'Test 6 status');
  assertEqual(res6.competitorId, null, 'Test 6 competitorId');
  assertEqual(res6.candidateCount, 2, 'Test 6 candidateCount');

  // Test 7: Duplicate competitor domain ambiguity (fail-closed)
  const res7 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'shareddomain.com' });
  assertEqual(res7.status, 'AMBIGUOUS', 'Test 7 status');
  assertEqual(res7.competitorId, null, 'Test 7 competitorId');
  assertEqual(res7.candidateCount, 2, 'Test 7 candidateCount');

  // Test 8: Name/Domain precedence collision (Name match in Pass 1 takes precedence)
  // Create a competitor whose name is "beta.io"
  const compAPrecedenceName = await prisma.competitor.create({
    data: {
      orgId: orgAId,
      name: 'beta.io',
      domain: 'other.io',
      logoText: 'PN',
      logoColor: '#aaaaaa',
      status: 'Active',
    },
  });
  const res8 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'beta.io' });
  assertEqual(res8.status, 'RESOLVED', 'Test 8 status');
  assertEqual(res8.competitorId, compAPrecedenceName.id, 'Test 8 competitorId should be name match');
  assertEqual(res8.matchStrategy, 'EXACT_NAME', 'Test 8 matchStrategy');

  // Test 9: Similar-but-not-equal name -> UNRESOLVED
  const res9 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'Acme' });
  assertEqual(res9.status, 'UNRESOLVED', 'Test 9 status');
  assertEqual(res9.competitorId, null, 'Test 9 competitorId');

  // Test 10: Product exact name with valid competitor context
  const res10 = await entityResolverService.resolveProduct({ orgId: orgAId, mention: 'CloudPro', competitorId: compA1.id });
  assertEqual(res10.status, 'RESOLVED', 'Test 10 status');
  assertEqual(res10.productId, prodA1.id, 'Test 10 productId');
  assertEqual(res10.competitorId, compA1.id, 'Test 10 competitorId');

  // Test 11: Product exact name without competitor context
  const res11 = await entityResolverService.resolveProduct({ orgId: orgAId, mention: 'Beta Systems' });
  assertEqual(res11.status, 'UNRESOLVED', 'Test 11 status');

  // Test 12: Duplicate products inside same org (without competitor context) -> AMBIGUOUS
  const res12 = await entityResolverService.resolveProduct({ orgId: orgAId, mention: 'CloudPro' });
  assertEqual(res12.status, 'AMBIGUOUS', 'Test 12 status');
  assertEqual(res12.productId, null, 'Test 12 productId');
  assertEqual(res12.candidateCount, 2, 'Test 12 candidateCount');

  // Test 13: Identical products across tenants -> RESOLVED to authorized tenant's product only
  const res13 = await entityResolverService.resolveProduct({ orgId: orgBId, mention: 'CloudPro' });
  assertEqual(res13.status, 'RESOLVED', 'Test 13 status');
  assertEqual(res13.productId, prodB1.id, 'Test 13 productId');
  assertEqual(res13.competitorId, compB1.id, 'Test 13 competitorId');

  // Test 14: Foreign competitor context rejection -> UNRESOLVED (fail-closed)
  const res14 = await entityResolverService.resolveProduct({ orgId: orgAId, mention: 'CloudPro', competitorId: compB1.id });
  assertEqual(res14.status, 'UNRESOLVED', 'Test 14 status');
  assertEqual(res14.productId, null, 'Test 14 productId');

  // Test 15: Nonexistent competitor context -> UNRESOLVED
  const res15 = await entityResolverService.resolveProduct({ orgId: orgAId, mention: 'CloudPro', competitorId: 'nonexistent-id' });
  assertEqual(res15.status, 'UNRESOLVED', 'Test 15 status');

  // Test 16: Empty mention -> UNRESOLVED
  const res16 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: '   ' });
  assertEqual(res16.status, 'UNRESOLVED', 'Test 16 status');

  // Test 17: Empty orgId -> UNRESOLVED
  const res17 = await entityResolverService.resolveCompetitor({ orgId: '', mention: 'Acme Corp' });
  assertEqual(res17.status, 'UNRESOLVED', 'Test 17 status');

  // Test 18: Malformed domain -> returns "" safely and handles cleanly
  assertEqual(normalizeDomain('invalid domain name with spaces'), '', 'Test 18 normalizeDomain');

  // Test 19: Unicode normalization repeatability
  const unicodeName1 = 'Café Systems'.normalize('NFD');
  const unicodeName2 = 'Café Systems'.normalize('NFC');
  assertEqual(normalizeEntityName(unicodeName1), normalizeEntityName(unicodeName2), 'Test 19 Unicode normalization');

  // Test 20: Conservative punctuation preservation
  const res20a = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'Acme, Inc.' });
  assertEqual(res20a.status, 'RESOLVED', 'Test 20a status');
  assertEqual(res20a.competitorId, compAPunct1.id, 'Test 20a competitorId');

  const res20b = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'Acme Inc.' });
  assertEqual(res20b.status, 'RESOLVED', 'Test 20b status');
  assertEqual(res20b.competitorId, compAPunct2.id, 'Test 20b competitorId');

  // Test 21: Subdomain preservation ("shop.acme.com" vs "acme.com")
  const res21 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'shop.acme.com' });
  assertEqual(res21.status, 'RESOLVED', 'Test 21 status');
  assertEqual(res21.competitorId, compASubdomain.id, 'Test 21 competitorId');

  // Test 22: Deterministic repeatability across multiple runs
  const repeat1 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'Acme Corp' });
  const repeat2 = await entityResolverService.resolveCompetitor({ orgId: orgAId, mention: 'Acme Corp' });
  assertEqual(repeat1.competitorId, repeat2.competitorId, 'Test 22 repeatability');

  // Clean up test data
  await prisma.product.deleteMany({
    where: { competitor: { orgId: { in: [orgAId, orgBId] } } },
  });
  await prisma.competitor.deleteMany({
    where: { orgId: { in: [orgAId, orgBId] } },
  });
  await prisma.organization.deleteMany({
    where: { id: { in: [orgAId, orgBId] } },
  });

  console.log('\nAll 22 Tenant-Safe Entity Resolver tests passed successfully!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
