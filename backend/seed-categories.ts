import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding categories with new images...');

  const baseUrl = process.env.APP_URL || 'http://127.0.0.1:5000';

  const categoriesToSeed = [
    {
      name: 'Drivers & Woods',
      slug: 'drivers',
      icon: 'Target',
      isActive: true,
      image: `${baseUrl}/uploads/categories/drivers.jpg`,
    },
    {
      name: 'Iron Sets & Wedges',
      slug: 'irons',
      icon: 'Crosshair',
      isActive: true,
      image: `${baseUrl}/uploads/categories/irons.jpg`,
    },
    {
      name: 'Putters',
      slug: 'putters',
      icon: 'Flag',
      isActive: true,
      image: `${baseUrl}/uploads/categories/putters.jpg`,
    },
    {
      name: 'Golf Experiences',
      slug: 'experiences',
      icon: 'Star',
      isActive: true,
      image: `${baseUrl}/uploads/categories/experiences.jpg`,
    },
    {
      name: 'Golf Bags & Trolleys',
      slug: 'bags',
      icon: 'Briefcase',
      isActive: true,
      image: `${baseUrl}/uploads/categories/bags.jpg`,
    },
    {
      name: 'Apparel & Shoes',
      slug: 'apparel',
      icon: 'Shirt',
      isActive: true,
      image: `${baseUrl}/uploads/categories/apparel.jpg`,
    },
    {
      name: 'Rangefinders & Tech',
      slug: 'tech',
      icon: 'Compass',
      isActive: true,
      image: `${baseUrl}/uploads/categories/tech.jpg`,
    },
    {
      name: 'Golf Balls & Accessories',
      slug: 'accessories',
      icon: 'Circle',
      isActive: true,
      image: `${baseUrl}/uploads/categories/accessories.jpg`,
    },
    {
      name: 'Cash Prizes',
      slug: 'cash-prizes',
      icon: 'DollarSign',
      isActive: true,
      image: `${baseUrl}/uploads/categories/cash_prizes.jpg`,
    },
  ];

  for (const cat of categoriesToSeed) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        icon: cat.icon,
        image: cat.image,
        name: cat.name,
        isActive: cat.isActive,
      },
      create: cat,
    });
    console.log(`Seeded category: ${cat.name}`);
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
