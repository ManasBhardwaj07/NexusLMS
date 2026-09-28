import { PrismaClient, Role, CourseStatus, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed...');

  // 1. Idempotency Guard: Refuse to run if real data exists.
  // We define "real data" as any user whose email doesn't end in @example.test.
  const realUsersCount = await prisma.user.count({
    where: {
      NOT: {
        email: { endsWith: '@example.test' }
      }
    }
  });

  if (realUsersCount > 0) {
    console.warn('Idempotency Guard triggered: Real (non-seed) rows detected in DB. Aborting seed.');
    process.exit(0);
  }

  // Ensure clean state for seed data
  await prisma.user.deleteMany({ where: { email: { endsWith: '@example.test' } } });
  await prisma.course.deleteMany({ where: { slug: { startsWith: 'seed-' } } });
  await prisma.coupon.deleteMany({ where: { code: 'LAUNCH50' } });

  // 2. Create Users
  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.test',
      name: 'Seed Admin',
      role: Role.ADMIN,
    }
  });

  // 1 Mentor
  const mentor = await prisma.user.create({
    data: {
      email: 'mentor@example.test',
      name: 'Seed Mentor',
      role: Role.MENTOR,
    }
  });

  // 5 Students (3 adults, 1 minor pending, 1 minor verified)
  const adult1 = await prisma.user.create({ data: { email: 'student1@example.test', name: 'Adult Student 1', dateOfBirth: new Date('1990-01-01') } });
  const adult2 = await prisma.user.create({ data: { email: 'student2@example.test', name: 'Adult Student 2', dateOfBirth: new Date('1995-01-01') } });
  const adult3 = await prisma.user.create({ data: { email: 'student3@example.test', name: 'Adult Student 3', dateOfBirth: new Date('2000-01-01') } });

  // Minor: PENDING
  const minorPending = await prisma.user.create({
    data: {
      email: 'minor-pending@example.test',
      name: 'Minor Pending',
      dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 15)), // 15 years old
      isMinor: true,
      consentState: 'PENDING'
    }
  });

  // Minor: VERIFIED
  const minorVerified = await prisma.user.create({
    data: {
      email: 'minor-verified@example.test',
      name: 'Minor Verified',
      dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 16)), // 16 years old
      isMinor: true,
      consentState: 'VERIFIED',
      parentalConsent: {
        create: {
          method: 'EMAIL',
          parentEmail: 'parent@example.test',
          tokenHash: 'synthetic-hashed-token-123',
          tokenExpiresAt: new Date(new Date().getTime() + 86400000), // +1 day
          verifiedAt: new Date(),
          ipAddress: '127.0.0.1'
        }
      }
    }
  });

  // 3. Create 2 Launch Courses with Module Trees
  const course1 = await prisma.course.create({
    data: {
      title: 'Competitive Programming: Zero to Hero',
      slug: 'seed-cp-zero-to-hero',
      description: 'The ultimate guide to CP.',
      category: 'Algorithms',
      level: 'Beginner',
      priceCents: 499900, // ₹4999.00
      status: CourseStatus.PUBLISHED,
      createdById: admin.id,
      modules: {
        create: [
          {
            title: 'Module 1: Introduction to Time Complexity',
            position: 1,
            lectures: {
              create: [
                { title: 'Big O Notation', videoUid: 'synthetic-uid-1', position: 1, isPreview: true },
                { title: 'Space vs Time', videoUid: 'synthetic-uid-2', position: 2 }
              ]
            }
          },
          {
            title: 'Module 2: Arrays and Strings',
            position: 2,
            lectures: {
              create: [
                { title: 'Two Pointers', videoUid: 'synthetic-uid-3', position: 1 },
                { title: 'Sliding Window', videoUid: 'synthetic-uid-4', position: 2 }
              ]
            }
          }
        ]
      }
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced Graph Algorithms',
      slug: 'seed-advanced-graphs',
      description: 'Master graphs and dynamic programming.',
      category: 'Data Structures',
      level: 'Advanced',
      priceCents: 999900, // ₹9999.00
      status: CourseStatus.PUBLISHED,
      createdById: admin.id,
      modules: {
        create: [
          {
            title: 'Module 1: Graph Traversal',
            position: 1,
            lectures: {
              create: [
                { title: 'BFS and DFS', videoUid: 'synthetic-uid-5', position: 1, isPreview: true }
              ]
            }
          },
          {
            title: 'Module 2: Shortest Paths',
            position: 2,
            lectures: {
              create: [
                { title: 'Dijkstra Algorithm', videoUid: 'synthetic-uid-6', position: 1 },
                { title: 'Bellman-Ford', videoUid: 'synthetic-uid-7', position: 2 }
              ]
            }
          }
        ]
      }
    }
  });

  // 4. Create Test Coupon
  await prisma.coupon.create({
    data: {
      code: 'LAUNCH50',
      discountType: DiscountType.PERCENT,
      value: 50,
      validFrom: new Date(),
      validTo: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
      maxUses: 100,
      active: true
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
