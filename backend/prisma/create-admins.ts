import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface AdminAccountConfig {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}

const adminAccounts: AdminAccountConfig[] = [
  {
    email: 'jon.roberts@fairwaydraws.com',
    firstName: 'Jon',
    lastName: 'Roberts',
    password: process.env.JON_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'FairwayAdmin2026!',
  },
  {
    email: 'kara.clegg@fairwaydraws.com',
    firstName: 'Kara',
    lastName: 'Clegg',
    password: process.env.KARA_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'FairwayAdmin2026!',
  },
  {
    email: 'lewis.mcmanus@fairwaydraws.com',
    firstName: 'Lewis',
    lastName: 'McManus',
    password: process.env.LEWIS_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'FairwayAdmin2026!',
  },
  {
    email: 'lewis@fairwaydraws.com',
    firstName: 'Lewis',
    lastName: 'McManus',
    password: process.env.LEWIS_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'FairwayAdmin2026!',
  },
  {
    email: 'lewismcmanus@gmail.com',
    firstName: 'Lewis',
    lastName: 'McManus',
    password: process.env.LEWIS_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'FairwayAdmin2026!',
  },
  {
    email: 'lewismcmanus@googlemail.com',
    firstName: 'Lewis',
    lastName: 'McManus',
    password: process.env.LEWIS_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'FairwayAdmin2026!',
  },
];

async function main() {
  console.log('🚀 Creating / Updating Fairway Draws Admin Accounts...\n');

  const salt = await bcrypt.genSalt(10);

  for (const account of adminAccounts) {
    const normalizedEmail = account.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(account.password!, salt);

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        role: 'ADMIN',
        isEmailVerified: true,
        isBlocked: false,
        firstName: account.firstName,
        lastName: account.lastName,
        passwordHash,
      },
      create: {
        email: normalizedEmail,
        passwordHash,
        role: 'ADMIN',
        isEmailVerified: true,
        isBlocked: false,
        firstName: account.firstName,
        lastName: account.lastName,
      },
    });

    console.log(`✅ Admin account ready:`);
    console.log(`   - ID:        ${user.id}`);
    console.log(`   - Email:     ${user.email}`);
    console.log(`   - Name:      ${user.firstName} ${user.lastName}`);
    console.log(`   - Role:      ${user.role}`);
    console.log(`   - Verified:  ${user.isEmailVerified}`);
    console.log(`   - Password:  ${account.password}\n`);
  }

  console.log('🎉 All admin accounts configured successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
