import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const clubCount = await prisma.club.count();
  const teamCount = await prisma.team.count();
  const matchCount = await prisma.match.count();
  const tournamentCount = await prisma.tournament.count();

  console.log('Database counts:');
  console.log(`Users: ${userCount}`);
  console.log(`Clubs: ${clubCount}`);
  console.log(`Teams: ${teamCount}`);
  console.log(`Matches: ${matchCount}`);
  console.log(`Tournaments: ${tournamentCount}`);

  // Show some data
  const clubs = await prisma.club.findMany({ take: 5 });
  console.log('\nClubs:', clubs);

  const teams = await prisma.team.findMany({ take: 5 });
  console.log('\nTeams:', teams);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
