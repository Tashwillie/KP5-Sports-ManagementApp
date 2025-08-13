-- Add statistics tables for real-time statistics tracking

-- Player Match Statistics
CREATE TABLE IF NOT EXISTS "player_match_stats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "foulsSuffered" INTEGER NOT NULL DEFAULT 0,
    "offsides" INTEGER NOT NULL DEFAULT 0,
    "passes" INTEGER NOT NULL DEFAULT 0,
    "passesCompleted" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "tacklesWon" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER,
    "goalsConceded" INTEGER,
    "cleanSheet" BOOLEAN,
    "rating" REAL DEFAULT 6.0,
    "distance" INTEGER DEFAULT 0,
    "sprints" INTEGER DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_match_stats_pkey" PRIMARY KEY ("id")
);

-- Team Match Statistics
CREATE TABLE IF NOT EXISTS "team_match_stats" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "corners" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "possession" INTEGER NOT NULL DEFAULT 50,
    "passes" INTEGER NOT NULL DEFAULT 0,
    "passesCompleted" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "offsides" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "distance" INTEGER NOT NULL DEFAULT 0,
    "sprints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_match_stats_pkey" PRIMARY KEY ("id")
);

-- Player Season Statistics
CREATE TABLE IF NOT EXISTS "player_season_stats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "matchesStarted" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "cleanSheets" INTEGER DEFAULT 0,
    "goalsConceded" INTEGER DEFAULT 0,
    "saves" INTEGER DEFAULT 0,
    "averageRating" REAL NOT NULL DEFAULT 6.0,
    "totalDistance" INTEGER NOT NULL DEFAULT 0,
    "totalSprints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_season_stats_pkey" PRIMARY KEY ("id")
);

-- Team Season Statistics
CREATE TABLE IF NOT EXISTS "team_season_stats" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "matchesWon" INTEGER NOT NULL DEFAULT 0,
    "matchesDrawn" INTEGER NOT NULL DEFAULT 0,
    "matchesLost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "cleanSheets" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "averageGoalsPerGame" REAL NOT NULL DEFAULT 0,
    "averageGoalsAgainstPerGame" REAL NOT NULL DEFAULT 0,
    "winPercentage" REAL NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_season_stats_pkey" PRIMARY KEY ("id")
);

-- Match Statistics
CREATE TABLE IF NOT EXISTS "match_statistics" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeTeamStats" JSONB NOT NULL,
    "awayTeamStats" JSONB NOT NULL,
    "playerStats" JSONB NOT NULL DEFAULT '[]',
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "totalGoals" INTEGER NOT NULL DEFAULT 0,
    "totalCards" INTEGER NOT NULL DEFAULT 0,
    "totalSubstitutions" INTEGER NOT NULL DEFAULT 0,
    "matchDuration" INTEGER NOT NULL DEFAULT 0,
    "averagePossession" REAL NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_statistics_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_playerId_matchId_key" UNIQUE ("playerId", "matchId");
ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_teamId_matchId_key" UNIQUE ("teamId", "matchId");
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_playerId_season_key" UNIQUE ("playerId", "season");
ALTER TABLE "team_season_stats" ADD CONSTRAINT "team_season_stats_teamId_season_key" UNIQUE ("teamId", "season");
ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_matchId_key" UNIQUE ("matchId");

-- Create indexes for better performance
CREATE INDEX "player_match_stats_playerId_idx" ON "player_match_stats"("playerId");
CREATE INDEX "player_match_stats_matchId_idx" ON "player_match_stats"("matchId");
CREATE INDEX "player_match_stats_teamId_idx" ON "player_match_stats"("teamId");
CREATE INDEX "team_match_stats_teamId_idx" ON "team_match_stats"("teamId");
CREATE INDEX "team_match_stats_matchId_idx" ON "team_match_stats"("matchId");
CREATE INDEX "player_season_stats_playerId_idx" ON "player_season_stats"("playerId");
CREATE INDEX "player_season_stats_season_idx" ON "player_season_stats"("season");
CREATE INDEX "player_season_stats_teamId_idx" ON "player_season_stats"("teamId");
CREATE INDEX "team_season_stats_teamId_idx" ON "team_season_stats"("teamId");
CREATE INDEX "team_season_stats_season_idx" ON "team_season_stats"("season");
CREATE INDEX "match_statistics_matchId_idx" ON "match_statistics"("matchId");

-- Add foreign key constraints
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "team_season_stats" ADD CONSTRAINT "team_season_stats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
