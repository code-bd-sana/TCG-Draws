import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding ACTIVE not-sold-out raffles...');

  const baseUrl = process.env.APP_URL || 'http://127.0.0.1:5000';

  const hostProfile = await prisma.hostProfile.findFirst();
  if (!hostProfile) {
    console.error('No host profile found. Cannot create raffles.');
    return;
  }

  // Active dates
  const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5); // Started 5 days ago
  const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10); // Ends in 10 days

  const activeRaffles = [
    {
      title: 'TaylorMade Qi10 Max Driver',
      prizeName: 'TaylorMade Qi10 Max Driver',
      mainImage: `${baseUrl}/uploads/categories/drivers.jpg`,
      slug: 'active-taylormade-qi10',
      ticketsSold: 45,
      totalTickets: 250,
      category: 'drivers',
    },
    {
      title: 'Titleist T100 Iron Set (4-PW)',
      prizeName: 'Titleist T100 Iron Set (4-PW)',
      mainImage: `${baseUrl}/uploads/categories/irons.jpg`,
      slug: 'active-titleist-t100',
      ticketsSold: 12,
      totalTickets: 150,
      category: 'irons',
    },
    {
      title: 'Scotty Cameron Phantom X 11',
      prizeName: 'Scotty Cameron Phantom X 11',
      mainImage: `${baseUrl}/uploads/categories/putters.jpg`,
      slug: 'active-scotty-cameron',
      ticketsSold: 89,
      totalTickets: 200,
      category: 'putters',
    },
    {
      title: 'Titleist Tour Stand Bag Bundle',
      prizeName: 'Titleist Tour Stand Bag Bundle',
      mainImage: `${baseUrl}/uploads/categories/bags.jpg`,
      slug: 'active-titleist-bag',
      ticketsSold: 110,
      totalTickets: 300,
      category: 'apparel',
    },
  ];

  for (const r of activeRaffles) {
    await prisma.raffle.upsert({
      where: { slug: r.slug },
      update: {
        status: 'ACTIVE',
        endDate: endDate,
        mainImage: r.mainImage,
        ticketsSold: r.ticketsSold,
        totalTickets: r.totalTickets,
      },
      create: {
        hostId: hostProfile.id,
        title: r.title,
        slug: r.slug,
        prizeName: r.prizeName,
        mainImage: r.mainImage,
        category: r.category,
        description: `Amazing active competition for ${r.prizeName}. Grab your tickets before they run out!`,
        pricePerTicket: 2.5,
        totalTickets: r.totalTickets,
        ticketsSold: r.ticketsSold,
        startDate: startDate,
        endDate: endDate,
        status: 'ACTIVE',
      },
    });
    console.log(`Created/Updated ACTIVE raffle: ${r.title}`);
  }

  console.log('Active raffles seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
