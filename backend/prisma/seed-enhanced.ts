import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting enhanced database seed...');

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

  // Create test coach user
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

  // Create test player users
  const players = [];
  for (let i = 1; i <= 5; i++) {
    const player = await prisma.user.upsert({
      where: { email: `player${i}@kp5academy.com` },
      update: {},
      create: {
        id: `test-player-${i}`,
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
    
    // Create user profile
    await prisma.userProfile.upsert({
      where: { userId: player.id },
      update: {},
      create: {
        userId: player.id,
        bio: `Test Player ${i} Account`,
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
  }

  // Create test clubs
  const club1 = await prisma.club.create({
    data: {
      id: 'test-club-1',
      name: 'KP5 Academy FC',
      description: 'Premier youth football academy',
      email: 'info@kp5academy.com',
      phone: '+1234567890',
      address: '123 Sports Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      website: 'https://kp5academy.com',
      logo: 'https://example.com/logo.png',
      isActive: true,
      creatorId: adminUser.id,
    },
  });

  const club2 = await prisma.club.create({
    data: {
      id: 'test-club-2',
      name: 'United Sports Club',
      description: 'Community sports club',
      email: 'info@unitedsc.com',
      phone: '+0987654321',
      address: '456 Stadium Rd',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90001',
      isActive: true,
      creatorId: adminUser.id,
    },
  });

  // Create test teams
  const team1 = await prisma.team.create({
    data: {
      id: 'test-team-1',
      name: 'KP5 Academy U-18',
      clubId: club1.id,
      creatorId: adminUser.id,
      ageGroup: 'U18',
      description: 'Under 18 competitive team',
      isActive: true,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      id: 'test-team-2',
      name: 'KP5 Academy U-16',
      clubId: club1.id,
      creatorId: adminUser.id,
      ageGroup: 'U16',
      description: 'Under 16 development team',
      isActive: true,
    },
  });

  // Add coach as team member
  await prisma.teamMember.create({
    data: {
      teamId: team1.id,
      userId: coachUser.id,
      role: 'COACH',
      isActive: true,
    },
  });

  // Add players to teams
  await prisma.teamMember.createMany({
    data: [
      { teamId: team1.id, userId: players[0].id, role: 'PLAYER', jerseyNumber: 10 },
      { teamId: team1.id, userId: players[1].id, role: 'PLAYER', jerseyNumber: 7 },
      { teamId: team1.id, userId: players[2].id, role: 'PLAYER', jerseyNumber: 4 },
      { teamId: team2.id, userId: players[3].id, role: 'PLAYER', jerseyNumber: 9 },
      { teamId: team2.id, userId: players[4].id, role: 'PLAYER', jerseyNumber: 5 },
    ],
  });

  // Create a tournament
  const tournament = await prisma.tournament.create({
    data: {
      id: 'test-tournament-1',
      name: 'Spring Championship 2024',
      description: 'Annual spring tournament',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      location: 'City Sports Complex',
      maxTeams: 16,
      status: 'UPCOMING',
      isActive: true,
      creatorId: adminUser.id,
    },
  });

  // Add teams to tournament
  await prisma.tournamentTeam.createMany({
    data: [
      { tournamentId: tournament.id, teamId: team1.id },
      { tournamentId: tournament.id, teamId: team2.id },
    ],
  });

  // Create matches
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.match.create({
    data: {
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

  await prisma.match.create({
    data: {
      id: 'test-match-2',
      title: 'KP5 U-16 vs KP5 U-18',
      homeTeamId: team2.id,
      awayTeamId: team1.id,
      startTime: nextWeek,
      location: 'Training Ground',
      status: 'SCHEDULED',
      creatorId: adminUser.id,
    },
  });

  await prisma.match.create({
    data: {
      id: 'test-match-3',
      title: 'Championship Final',
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      startTime: new Date('2024-02-15'),
      endTime: new Date('2024-02-15'),
      location: 'Main Stadium',
      status: 'COMPLETED',
      homeScore: 2,
      awayScore: 1,
      creatorId: adminUser.id,
    },
  });

  // Create tournament matches to link matches with tournament
  await prisma.tournamentMatch.createMany({
    data: [
      { tournamentId: tournament.id, matchId: 'test-match-1', round: 1 },
      { tournamentId: tournament.id, matchId: 'test-match-3', round: 3 },
    ],
  });

  console.log('✅ Enhanced database seeded successfully!');
  console.log('👤 Users created: Admin, Coach, and 5 Players');
  console.log('🏢 Clubs created: 2');
  console.log('👥 Teams created: 2');
  console.log('🏆 Tournament created: 1');
  console.log('⚽ Matches created: 3 (1 completed, 2 scheduled)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
