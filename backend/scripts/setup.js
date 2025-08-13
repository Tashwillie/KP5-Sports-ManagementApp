#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up KP5 Academy Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please edit it with your configuration.');
  } else {
    console.log('❌ env.example file not found. Please create a .env file manually.');
  }
} else {
  console.log('✅ .env file already exists.');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.');
} catch (error) {
  console.log('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully.');
} catch (error) {
  console.log('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Check if database is accessible
console.log('\n🗄️  Checking database connection...');
try {
  execSync('npx prisma db push --preview-feature', { stdio: 'inherit' });
  console.log('✅ Database connection successful.');
} catch (error) {
  console.log('❌ Database connection failed. Please check your DATABASE_URL in .env file.');
  console.log('💡 Make sure PostgreSQL is running and the database exists.');
  console.log('💡 You can create the database manually or use Docker:');
  console.log('   docker-compose up -d postgres');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('\n📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created.');
} else {
  console.log('\n✅ Uploads directory already exists.');
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('\n📁 Creating logs directory...');
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Logs directory created.');
} else {
  console.log('\n✅ Logs directory already exists.');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit the .env file with your configuration');
console.log('2. Start the development server: npm run dev');
console.log('3. Access the API at: http://localhost:3001');
console.log('4. Check health endpoint: http://localhost:3001/health');
console.log('\n🐳 Or use Docker:');
console.log('1. docker-compose up -d');
console.log('2. docker-compose exec backend npm run db:migrate');
console.log('3. docker-compose exec backend npm run db:seed'); 