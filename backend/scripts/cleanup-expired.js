const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupExpiredRecords() {
  try {
    console.log('Starting cleanup of expired records...');

    // Clean up expired phone verifications
    const deletedPhoneVerifications = await prisma.$executeRaw`
      DELETE FROM phone_verifications 
      WHERE expires_at < CURRENT_TIMESTAMP;
    `;
    console.log(`Deleted ${deletedPhoneVerifications} expired phone verifications`);

    // Clean up expired password reset tokens
    const deletedPasswordTokens = await prisma.$executeRaw`
      DELETE FROM password_reset_tokens 
      WHERE expires_at < CURRENT_TIMESTAMP;
    `;
    console.log(`Deleted ${deletedPasswordTokens} expired password reset tokens`);

    // Clean up used password reset tokens (older than 24 hours)
    const deletedUsedTokens = await prisma.$executeRaw`
      DELETE FROM password_reset_tokens 
      WHERE used = true AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours';
    `;
    console.log(`Deleted ${deletedUsedTokens} used password reset tokens`);

    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupExpiredRecords()
    .then(() => {
      console.log('Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupExpiredRecords };
