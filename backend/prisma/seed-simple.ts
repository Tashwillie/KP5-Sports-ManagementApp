import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create users if they don't exist
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

  const coachUser = await prisma.user.upsert({
    where: { email: 'coach@kp5academy.com' },
    update: {},
    create: {
      id: 'test-coach-1',
      email: 'coach@kp5academy.com',
      password: hashedPassword,
      displayName: 'John Coach',
      firstName: 'John',
      lastName: 'Coach',
      role: 'COACH',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create a few more users if they don't exist
  const players = [];
  for (let i = 1; i <= 3; i++) {
    try {
      const player = await prisma.user.upsert({
        where: { email: `player${i}@kp5academy.com` },
        update: {},
        create: {
          email: `player${i}@kp5academy.com`,
          password: hashedPassword,
          displayName: `Player ${i}`,
          firstName: `Player`,
          lastName: `${i}`,
          role: 'PLAYER',
          isActive: true,
          emailVerified: true,
        },
      });
      players.push(player);
    } catch (error) {
      console.log(`Player ${i} already exists`);
    }
  }

  // Create simple clubs
  const club1 = await prisma.club.upsert({
    where: { id: 'test-club-1' },
    update: {},
    create: {
      id: 'test-club-1',
      name: 'KP5 Academy FC',
      description: 'Premier youth football academy',
      email: 'info@kp5academy.com',
      phone: '+1234567890',
      isActive: true,
      creatorId: adminUser.id,
    },
  });

  const club2 = await prisma.club.upsert({
    where: { id: 'test-club-2' },
    update: {},
    create: {
      id: 'test-club-2',
      name: 'United Sports Club',
      description: 'Community sports club',
      isActive: true,
      creatorId: adminUser.id,
    },
  });

  // Create simple teams
  const team1 = await prisma.team.upsert({
    where: { id: 'test-team-1' },
    update: {},
    create: {
      id: 'test-team-1',
      name: 'KP5 Academy U-18',
      clubId: club1.id,
      creatorId: adminUser.id,
      description: 'Under 18 team',
      isActive: true,
    },
  });

  const team2 = await prisma.team.upsert({
    where: { id: 'test-team-2' },
    update: {},
    create: {
      id: 'test-team-2',
      name: 'KP5 Academy U-16',
      clubId: club1.id,
      creatorId: adminUser.id,
      description: 'Under 16 team',
      isActive: true,
    },
  });

  // Create simple tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: 'test-tournament-1' },
    update: {},
    create: {
      id: 'test-tournament-1',
      name: 'Spring Championship 2024',
      description: 'Annual spring tournament',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      location: 'City Sports Complex',
      format: 'ROUND_ROBIN',
      status: 'UPCOMING',
      isActive: true,
    },
  });

  // Create simple matches
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.match.upsert({
    where: { id: 'test-match-1' },
    update: {},
    create: {
      id: 'test-match-1',
      title: 'KP5 U-18 vs KP5 U-16',
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      startTime: tomorrow,
      location: 'Main Stadium',
      status: 'SCHEDULED',
      creatorId: adminUser.id,
    },
  });

  await prisma.match.upsert({
    where: { id: 'test-match-2' },
    update: {},
    create: {
      id: 'test-match-2',
      title: 'Championship Final',
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      startTime: new Date('2024-12-15'),
      location: 'Main Stadium',
      status: 'COMPLETED',
      homeScore: 2,
      awayScore: 1,
      creatorId: adminUser.id,
    },
  });

  const userCount = await prisma.user.count();
  const clubCount = await prisma.club.count();
  const teamCount = await prisma.team.count();
  const matchCount = await prisma.match.count();
  const tournamentCount = await prisma.tournament.count();

  console.log('✅ Simple database seeded successfully!');
  console.log(`👤 Users: ${userCount}`);
  console.log(`🏢 Clubs: ${clubCount}`);
  console.log(`👥 Teams: ${teamCount}`);
  console.log(`⚽ Matches: ${matchCount}`);
  console.log(`🏆 Tournaments: ${tournamentCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
