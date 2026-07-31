import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Organization
  const orgId = '11111111-1111-1111-1111-111111111111';
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      name: "Acme Corp",
      industry: "Technology",
    }
  });
  console.log(`✅ Organization created: ${org.name}`);

  // 2. Admin User
  const adminEmail = 'admin@acme.com';
  const hashedPassword = await bcrypt.hash("Password123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      orgId: org.id
    }
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 3. Competitors
  const comp1Id = '22222222-2222-2222-2222-222222222222';
  const comp1 = await prisma.competitor.upsert({
    where: { id: comp1Id },
    update: {},
    create: {
      id: comp1Id,
      name: "Synthetix",
      domain: "synthetix.ai",
      logoText: "S",
      logoColor: "bg-secondary-fixed/20 border-secondary-fixed text-primary-container",
      industry: "Cloud SaaS",
      status: "Active",
      score: 85,
      orgId: org.id
    }
  });

  const comp2Id = '33333333-3333-3333-3333-333333333333';
  const comp2 = await prisma.competitor.upsert({
    where: { id: comp2Id },
    update: {},
    create: {
      id: comp2Id,
      name: "Nexus Core",
      domain: "nexuscore.io",
      logoText: "N",
      logoColor: "bg-tertiary-fixed/20 border-tertiary-fixed text-tertiary",
      industry: "FinTech",
      status: "Alert",
      score: 92,
      orgId: org.id
    }
  });
  console.log(`✅ Competitors created: ${comp1.name}, ${comp2.name}`);

  // 4. Products
  const prod1Id = '44444444-4444-4444-4444-444444444444';
  const prod1 = await prisma.product.upsert({
    where: { id: prod1Id },
    update: {},
    create: {
      id: prod1Id,
      name: "Analytics",
      description: "Advanced data analytics suite",
      competitorId: comp1.id
    }
  });

  const prod2Id = '55555555-5555-5555-5555-555555555555';
  const prod2 = await prisma.product.upsert({
    where: { id: prod2Id },
    update: {},
    create: {
      id: prod2Id,
      name: "CRM",
      description: "Customer relationship management",
      competitorId: comp1.id
    }
  });

  const prod3Id = '66666666-6666-6666-6666-666666666666';
  const prod3 = await prisma.product.upsert({
    where: { id: prod3Id },
    update: {},
    create: {
      id: prod3Id,
      name: "Payments",
      description: "Payment gateway",
      competitorId: comp2.id
    }
  });
  
  const prod4Id = '77777777-7777-7777-7777-777777777777';
  const prod4 = await prisma.product.upsert({
    where: { id: prod4Id },
    update: {},
    create: {
      id: prod4Id,
      name: "API",
      description: "Core banking API",
      competitorId: comp2.id
    }
  });
  console.log(`✅ Products created: ${prod1.name}, ${prod2.name}, ${prod3.name}, ${prod4.name}`);

  // 5. Features
  await prisma.feature.upsert({
    where: { id: '88888888-8888-8888-8888-888888888881' },
    update: {},
    create: {
      id: '88888888-8888-8888-8888-888888888881',
      name: "Real-time sync",
      description: "Syncs data in real-time across platforms",
      status: "Available",
      productId: prod1.id
    }
  });

  await prisma.feature.upsert({
    where: { id: '88888888-8888-8888-8888-888888888882' },
    update: {},
    create: {
      id: '88888888-8888-8888-8888-888888888882',
      name: "Custom Dashboards",
      description: "User defined dashboards",
      status: "Beta",
      productId: prod1.id
    }
  });
  
  console.log(`✅ Features created.`);
  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
