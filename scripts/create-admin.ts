/**
 * Create the first admin account in production.
 * Reads from environment variables — never hard-codes credentials.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com \
 *   ADMIN_PASSWORD=strongpassword \
 *   ADMIN_NAME="Yasser Admin" \
 *   npm run admin:create
 *
 * Or set the vars in Render Environment, then run from Render Shell:
 *   npm run admin:create
 */

import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name     = process.env.ADMIN_NAME?.trim() ?? 'Admin';

  // ── Validate required vars ──────────────────────────────────────────────────
  if (!email || !password) {
    console.error('❌  ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌  ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  console.log(`\n🔍  Checking for existing admin: ${email}`);

  // ── Check if already exists ─────────────────────────────────────────────────
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    console.log(`⚠️   Admin with email "${email}" already exists (id=${existing.id}). Skipping.`);
    return;
  }

  // ── Hash password (cost factor 12 — same as bcryptjs default good practice) ─
  const password_hash = await bcrypt.hash(password, 12);

  // ── Create admin ────────────────────────────────────────────────────────────
  const admin = await prisma.admin.create({
    data: { name, email, password_hash, role: 'superadmin' },
    select: { id: true, name: true, email: true, role: true, created_at: true },
  });

  console.log('✅  Admin created successfully:');
  console.log(`    ID:    ${admin.id}`);
  console.log(`    Name:  ${admin.name}`);
  console.log(`    Email: ${admin.email}`);
  console.log(`    Role:  ${admin.role}`);
  console.log(`    At:    ${admin.created_at.toISOString()}`);
  console.log('\n🔒  Password is NOT logged for security reasons.');
  console.log('    You can now log in at /admin/login\n');
}

main()
  .catch((err) => {
    console.error('❌  Unexpected error:', err.message ?? err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
