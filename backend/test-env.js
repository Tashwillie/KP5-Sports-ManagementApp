require('dotenv').config();

console.log('🔍 Testing environment variables...\n');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('PORT:', process.env.PORT || '3001');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET value:', process.env.JWT_SECRET.substring(0, 20) + '...');
} else {
  console.log('❌ JWT_SECRET is not set!');
}

console.log('\n📁 Current directory:', process.cwd());
console.log('📄 .env file exists:', require('fs').existsSync('.env') ? '✅ Yes' : '❌ No');
