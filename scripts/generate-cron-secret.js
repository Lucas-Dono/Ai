#!/usr/bin/env node

/**
 * Generate a secure random token for CRON_SECRET
 *
 * Usage:
 *   node scripts/generate-cron-secret.js
 */

const crypto = require('crypto');

const token = crypto.randomBytes(32).toString('base64');

console.log('\n=================================');
console.log('CRON_SECRET Token Generated');
console.log('=================================\n');
console.log('Add this to your .env file:');
console.log(`CRON_SECRET="${token}"`);
console.log('\nFor Vercel deployment, add it with:');
console.log(`vercel env add CRON_SECRET production`);
console.log('(then paste the token above when prompted)\n');
console.log('Keep this token SECRET and secure!');
console.log('=================================\n');
