-- KP5 Academy Database Initialization Script

-- Create the database if it doesn't exist (this is handled by POSTGRES_DB environment variable)
-- The database 'kp5_academy' will be created automatically by PostgreSQL

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE kp5_academy TO kp5_user;

-- Connect to the database
\c kp5_academy;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The actual tables will be created by Prisma migrations
-- This script just ensures the database is ready for Prisma 