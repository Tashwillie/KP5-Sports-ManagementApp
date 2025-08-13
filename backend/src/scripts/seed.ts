import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    // Create sample users
    console.log('👥 Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@kp5academy.com' },
        update: {},
        create: {
          email: 'admin@kp5academy.com',
          password: hashedPassword,
          displayName: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'coach@kp5academy.com' },
        update: {},
        create: {
          email: 'coach@kp5academy.com',
          password: hashedPassword,
          displayName: 'Coach Johnson',
          firstName: 'John',
          lastName: 'Johnson',
          role: 'COACH',
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'player@kp5academy.com' },
        update: {},
        create: {
          email: 'player@kp5academy.com',
          password: hashedPassword,
          displayName: 'Mike Player',
          firstName: 'Mike',
          lastName: 'Player',
          role: 'PLAYER',
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample clubs
    console.log('\n🏢 Creating sample clubs...');
    const clubs = await Promise.all([
      prisma.club.create({
        data: {
          name: 'KP5 Academy',
          description: 'Premier sports academy for youth development',
          address: '123 Sports Street, City, State 12345',
          phone: '+1-555-0123',
          email: 'info@kp5academy.com',
          website: 'https://kp5academy.com',
          logo: null,
          creatorId: users[0].id,
        },
      }),
      prisma.club.create({
        data: {
          name: 'Elite Sports Club',
          description: 'Professional sports training facility',
          address: '456 Elite Avenue, City, State 12345',
          phone: '+1-555-0456',
          email: 'info@elitesports.com',
          website: 'https://elitesports.com',
          logo: null,
          creatorId: users[0].id,
        },
      }),
    ]);

    console.log(`✅ Created ${clubs.length} clubs`);

    // Create sample teams
    console.log('\n👥 Creating sample teams...');
    const teams = await Promise.all([
      prisma.team.create({
        data: {
          name: 'U16 Boys',
          description: 'Under 16 Boys Team',
          ageGroup: 'U16',
          gender: 'MALE',
          clubId: clubs[0].id,
          creatorId: users[1].id,
        },
      }),
      prisma.team.create({
        data: {
          name: 'U16 Girls',
          description: 'Under 16 Girls Team',
          ageGroup: 'U16',
          gender: 'FEMALE',
          clubId: clubs[0].id,
          creatorId: users[1].id,
        },
      }),
      prisma.team.create({
        data: {
          name: 'U14 Boys',
          description: 'Under 14 Boys Team',
          ageGroup: 'U14',
          gender: 'MALE',
          clubId: clubs[0].id,
          creatorId: users[1].id,
        },
      }),
      prisma.team.create({
        data: {
          name: 'U14 Girls',
          description: 'Under 14 Girls Team',
          ageGroup: 'U14',
          gender: 'FEMALE',
          clubId: clubs[0].id,
          creatorId: users[1].id,
        },
      }),
    ]);

    console.log(`✅ Created ${teams.length} teams`);

    // Create sample tournaments
    console.log('\n🏆 Creating sample tournaments...');
    const tournaments = await Promise.all([
      prisma.tournament.create({
        data: {
          name: 'Spring Championship 2024',
          description: 'Annual spring championship tournament',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-20'),
          location: 'KP5 Academy Stadium',
          format: 'ROUND_ROBIN',
          status: 'UPCOMING',
          maxTeams: 16,
          clubId: clubs[0].id,
        },
      }),
      prisma.tournament.create({
        data: {
          name: 'Summer League 2024',
          description: 'Summer league competition',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          location: 'Elite Sports Complex',
          format: 'SINGLE_ELIMINATION',
          status: 'UPCOMING',
          maxTeams: 8,
          clubId: clubs[1].id,
        },
      }),
    ]);

    console.log(`✅ Created ${tournaments.length} tournaments`);

    // Create sample matches
    console.log('\n⚽ Creating sample matches...');
    const matches = await Promise.all([
      prisma.match.create({
        data: {
          title: 'U16 Boys vs U16 Girls',
          homeTeamId: teams[0].id,
          awayTeamId: teams[1].id,
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 minutes later
          status: 'SCHEDULED',
          location: 'KP5 Academy Stadium',
          creatorId: users[1].id,
        },
      }),
      prisma.match.create({
        data: {
          title: 'U14 Boys vs U14 Girls',
          homeTeamId: teams[2].id,
          awayTeamId: teams[3].id,
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
          status: 'SCHEDULED',
          location: 'KP5 Academy Stadium',
          creatorId: users[1].id,
        },
      }),
      prisma.match.create({
        data: {
          title: 'U16 Boys vs U14 Boys',
          homeTeamId: teams[0].id,
          awayTeamId: teams[2].id,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
          status: 'COMPLETED',
          location: 'KP5 Academy Stadium',
          creatorId: users[1].id,
        },
      }),
    ]);

    console.log(`✅ Created ${matches.length} matches`);

    // Create sample events
    console.log('\n📅 Creating sample events...');
    const events = await Promise.all([
      prisma.event.create({
        data: {
          title: 'Team Practice',
          description: 'Regular team practice session',
          type: 'PRACTICE',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          location: 'KP5 Academy Training Ground',
          teamId: teams[0].id,
          creatorId: users[1].id,
        },
      }),
      prisma.event.create({
        data: {
          title: 'Tournament Meeting',
          description: 'Pre-tournament team meeting',
          type: 'MEETING',
          startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
          endTime: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours from now
          location: 'KP5 Academy Conference Room',
          teamId: teams[0].id,
          creatorId: users[1].id,
        },
      }),
    ]);

    console.log(`✅ Created ${events.length} events`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample data created:');
    console.log(`- ${users.length} users`);
    console.log(`- ${clubs.length} clubs`);
    console.log(`- ${teams.length} teams`);
    console.log(`- ${tournaments.length} tournaments`);
    console.log(`- ${matches.length} matches`);
    console.log(`- ${events.length} events`);
    console.log('\n🔑 Default login credentials:');
    console.log('Email: admin@kp5academy.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
