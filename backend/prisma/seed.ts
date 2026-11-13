import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Sunflower Animation app...');

  // Upsert the starter sunflower so running seed multiple times is idempotent
  const starterSunflower = await prisma.sunflower.upsert({
    where: {
      id: 'starter-sunflower-001',
    },
    update: {
      name: 'Helianthus Starter',
      growthStage: 35,
      waterLevel: 75,
      sunlightExposure: 80,
      petalColor: '#FFD700',
      height: 45.0,
      lastWateredAt: new Date(),
    },
    create: {
      id: 'starter-sunflower-001',
      name: 'Helianthus Starter',
      growthStage: 35,
      waterLevel: 75,
      sunlightExposure: 80,
      petalColor: '#FFD700',
      height: 45.0,
      lastWateredAt: new Date(),
    },
  });

  console.log('🌻 Starter sunflower seeded successfully:');
  console.log({
    id: starterSunflower.id,
    name: starterSunflower.name,
    growthStage: `${starterSunflower.growthStage}%`,
    waterLevel: `${starterSunflower.waterLevel}%`,
    sunlightExposure: `${starterSunflower.sunlightExposure}%`,
    petalColor: starterSunflower.petalColor,
    height: `${starterSunflower.height} cm`,
    lastWateredAt: starterSunflower.lastWateredAt.toISOString(),
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
