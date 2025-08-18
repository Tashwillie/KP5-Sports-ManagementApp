import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create test admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kp5academy.com' },
    update: {},
    create: {
      id: 'test-admin-1',
      email: 'admin@kp5academy.com',
      password: hashedPassword,
      displayName: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create test player user
  const playerUser = await prisma.user.upsert({
    where: { email: 'player@kp5academy.com' },
    update: {},
    create: {
      id: 'test-player-1',
      email: 'player@kp5academy.com',
      password: hashedPassword,
      displayName: 'Test Player',
      firstName: 'Test',
      lastName: 'Player',
      role: 'PLAYER',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create user profiles
  await prisma.userProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      bio: 'System Administrator',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      eventReminders: true,
      matchUpdates: true,
      teamMessages: true,
      clubAnnouncements: true,
      tournamentUpdates: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: playerUser.id },
    update: {},
    create: {
      userId: playerUser.id,
      bio: 'Test Player Account',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      eventReminders: true,
      matchUpdates: true,
      teamMessages: true,
      clubAnnouncements: true,
      tournamentUpdates: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user:', adminUser.email);
  console.log('👤 Player user:', playerUser.email);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
