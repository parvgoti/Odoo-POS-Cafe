/**
 * Database Mastery — Seed Script Template
 * Use as a starting point for seeding any database (2026)
 *
 * Usage: node seed.js [--clean] [--count=100]
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
import crypto from 'node:crypto';

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const shouldClean = args.includes('--clean');
const countArg = args.find(a => a.startsWith('--count='));
const SEED_COUNT = countArg ? parseInt(countArg.split('=')[1], 10) : 50;

// =============================================
// HELPERS
// =============================================
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + crypto.randomBytes(3).toString('hex');
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const FIRST_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace',
  'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah',
  'Olivia', 'Peter', 'Quinn', 'Ruby', 'Sam', 'Tara',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis',
  'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Clark',
];

const POST_TITLES = [
  'Getting Started with PostgreSQL 17',
  'Redis Caching Strategies for Production',
  'MongoDB Aggregation Pipeline Deep Dive',
  'Database Indexing Best Practices',
  'Building Real-Time Apps with WebSockets',
  'API Rate Limiting with Redis',
  'Prisma ORM Advanced Patterns',
  'SQL Window Functions Explained',
  'Full-Text Search Implementation Guide',
  'Database Migration Strategies',
  'Connection Pooling Explained',
  'NoSQL vs SQL: When to Use What',
  'Building Audit Logs from Scratch',
  'Multi-Tenancy Database Patterns',
  'Database Backup and Recovery Guide',
];

const TAG_NAMES = [
  'postgresql', 'mongodb', 'redis', 'prisma', 'sql',
  'nosql', 'performance', 'security', 'tutorial', 'architecture',
  'nodejs', 'python', 'devops', 'cloud', 'best-practices',
];

// =============================================
// SEED FUNCTIONS
// =============================================
async function seedTags() {
  console.log('  Seeding tags...');
  const tags = TAG_NAMES.map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    slug: name,
  }));

  await prisma.tag.createMany({ data: tags, skipDuplicates: true });
  return prisma.tag.findMany();
}

async function seedUsers(count) {
  console.log(`  Seeding ${count} users...`);
  const passwordHash = await hash('Password123!');
  const users = [];

  // Admin user
  users.push({
    email: 'admin@example.com',
    passwordHash,
    name: 'Admin User',
    role: 'ADMIN',
    status: 'ACTIVE',
    emailVerified: true,
    loginCount: randomInt(10, 200),
    lastLoginAt: new Date(),
    createdAt: randomDate(new Date('2024-01-01'), new Date('2024-06-01')),
  });

  // Regular users
  for (let i = 0; i < count - 1; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    users.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
      passwordHash,
      name: `${firstName} ${lastName}`,
      role: randomItem(['USER', 'USER', 'USER', 'USER', 'MODERATOR']),
      status: randomItem(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE']),
      emailVerified: Math.random() > 0.3,
      loginCount: randomInt(0, 500),
      lastLoginAt: Math.random() > 0.2 ? randomDate(new Date('2024-06-01'), new Date()) : null,
      createdAt: randomDate(new Date('2024-01-01'), new Date()),
    });
  }

  await prisma.user.createMany({ data: users, skipDuplicates: true });
  return prisma.user.findMany({ select: { id: true } });
}

async function seedPosts(users, tags) {
  console.log(`  Seeding posts...`);
  const posts = [];

  for (const title of POST_TITLES) {
    const author = randomItem(users);
    const createdAt = randomDate(new Date('2024-03-01'), new Date());
    const isPublished = Math.random() > 0.2;

    posts.push({
      title,
      slug: generateSlug(title),
      content: `This is the full content of "${title}". It covers important concepts and best practices for modern database engineering. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      excerpt: `A comprehensive guide to ${title.toLowerCase()}.`,
      status: isPublished ? 'PUBLISHED' : 'DRAFT',
      publishedAt: isPublished ? createdAt : null,
      viewCount: isPublished ? randomInt(10, 5000) : 0,
      authorId: author.id,
      createdAt,
    });
  }

  for (const postData of posts) {
    const post = await prisma.post.create({ data: postData });
    // Attach random tags
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, randomInt(1, 4));
    await prisma.post.update({
      where: { id: post.id },
      data: { tags: { connect: randomTags.map(t => ({ id: t.id })) } },
    });
  }

  return prisma.post.findMany({ select: { id: true } });
}

// =============================================
// MAIN
// =============================================
async function main() {
  console.log('\n🌱 Database Seed Script\n');

  if (shouldClean) {
    console.log('  🗑️  Cleaning database...');
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.session.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    console.log('  ✓ Database cleaned\n');
  }

  const tags = await seedTags();
  console.log(`  ✓ ${tags.length} tags created`);

  const users = await seedUsers(SEED_COUNT);
  console.log(`  ✓ ${users.length} users created`);

  const posts = await seedPosts(users, tags);
  console.log(`  ✓ ${posts.length} posts created`);

  console.log('\n✅ Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
