/**
 * Email Sequences Cron Job
 *
 * Runs daily to:
 * 1. Process scheduled emails
 * 2. Check for inactive users
 * 3. Check trial subscriptions
 *
 * Configured to run via Vercel Cron or external cron service
 */

import { NextRequest, NextResponse } from 'next/server';
import { processScheduledEmails } from '@/lib/email/sequences/sequence.service';
import { checkInactiveUsers, checkTrialSubscriptions } from '@/lib/email/triggers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const startTime = Date.now();

  try {
    console.log('📧 Starting email sequences cron job...');

    // 1. Process scheduled emails
    console.log('1️⃣ Processing scheduled emails...');
    const emailResults = await processScheduledEmails();
    console.log(
      `   ✅ Processed: ${emailResults.processed}, Sent: ${emailResults.sent}, Failed: ${emailResults.failed}`
    );

    // 2. Check for inactive users
    console.log('2️⃣ Checking inactive users...');
    await checkInactiveUsers();

    // 3. Check trial subscriptions
    console.log('3️⃣ Checking trial subscriptions...');
    await checkTrialSubscriptions();

    // 4. Update analytics
    console.log('4️⃣ Updating email analytics...');
    await updateEmailAnalytics();

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      results: {
        emailsProcessed: emailResults.processed,
        emailsSent: emailResults.sent,
        emailsFailed: emailResults.failed,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Email sequences cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Update daily analytics for email sequences
 */
async function updateEmailAnalytics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all sequences
  const sequences = await prisma.emailSequence.findMany({
    where: { active: true },
  });

  for (const sequence of sequences) {
    // Get stats for today
    const sentEmails = await prisma.emailSent.findMany({
      where: {
        sequenceId: sequence.id,
        createdAt: {
          gte: today,
        },
      },
    });

    const stats = {
      scheduled: sentEmails.filter(e => e.status === 'pending').length,
      sent: sentEmails.filter(e => e.status === 'sent' || e.status === 'delivered').length,
      delivered: sentEmails.filter(e => e.delivered).length,
      bounced: sentEmails.filter(e => e.status === 'bounced').length,
      failed: sentEmails.filter(e => e.status === 'failed').length,
      opened: sentEmails.filter(e => e.opened).length,
      clicked: sentEmails.filter(e => e.clicked).length,
      converted: sentEmails.filter(e => e.converted).length,
      unsubscribed: sentEmails.filter(e => e.unsubscribed).length,
    };

    const deliveryRate = stats.sent > 0 ? stats.delivered / stats.sent : 0;
    const openRate = stats.delivered > 0 ? stats.opened / stats.delivered : 0;
    const clickRate = stats.opened > 0 ? stats.clicked / stats.opened : 0;
    const conversionRate = stats.sent > 0 ? stats.converted / stats.sent : 0;
    const unsubscribeRate = stats.delivered > 0 ? stats.unsubscribed / stats.delivered : 0;

    // Upsert analytics record
    await prisma.emailSequenceAnalytics.upsert({
      where: {
        sequenceId_date: {
          sequenceId: sequence.id,
          date: today,
        },
      },
      create: {
        sequenceId: sequence.id,
        date: today,
        ...stats,
        deliveryRate,
        openRate,
        clickRate,
        conversionRate,
        unsubscribeRate,
      },
      update: {
        ...stats,
        deliveryRate,
        openRate,
        clickRate,
        conversionRate,
        unsubscribeRate,
      },
    });
  }

  console.log(`   ✅ Updated analytics for ${sequences.length} sequences`);
}
