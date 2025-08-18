-- KP5 Academy Database Setup Script
-- This script creates the basic tables needed for authentication

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'COACH', 'CLUB_ADMIN', 'REFEREE', 'PARENT', 'SUPER_ADMIN');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "displayName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "position" TEXT,
    "jerseyNumber" INTEGER,
    "emergencyContact" TEXT,
    "medicalInfo" TEXT,
    "preferences" JSONB,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "eventReminders" BOOLEAN NOT NULL DEFAULT true,
    "matchUpdates" BOOLEAN NOT NULL DEFAULT true,
    "teamMessages" BOOLEAN NOT NULL DEFAULT true,
    "clubAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "tournamentUpdates" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_userId_key" ON "user_profiles"("userId");

-- Add foreign key constraint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create a test user for authentication testing
INSERT INTO "users" ("id", "email", "password", "displayName", "firstName", "lastName", "role", "isActive", "emailVerified") 
VALUES (
    'test-user-1',
    'admin@kp5academy.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.8KqKqK', -- password: admin123
    'Admin User',
    'Admin',
    'User',
    'SUPER_ADMIN',
    true,
    true
) ON CONFLICT ("email") DO NOTHING;

-- Create a regular player user
INSERT INTO "users" ("id", "email", "password", "displayName", "firstName", "lastName", "role", "isActive", "emailVerified") 
VALUES (
    'test-user-2',
    'player@kp5academy.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.8KqKqK', -- password: admin123
    'Test Player',
    'Test',
    'Player',
    'PLAYER',
    true,
    true
) ON CONFLICT ("email") DO NOTHING;

-- Display the created tables
\dt

-- Display the created users
SELECT "id", "email", "displayName", "role", "isActive" FROM "users";
