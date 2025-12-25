/**
 * Authentication Email Service
 *
 * Handles sending emails for:
 * - Email verification
 * - Password reset
 * - Password change notifications
 */

import { prisma } from '@/lib/prisma';
import { sendEmail } from './index';
import { render } from '@react-email/components';
import { emailLogger as log } from '@/lib/logging/loggers';
import crypto from 'crypto';
import EmailVerification from './templates/auth/EmailVerification';
import PasswordReset from './templates/auth/PasswordReset';
import PasswordChanged from './templates/auth/PasswordChanged';
import React from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Check if email system is enabled
 */
function isEmailEnabled(): boolean {
  return process.env.EMAIL_ENABLED === 'true';
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send email verification
 */
export async function sendEmailVerification(userId: string, email: string, userName?: string) {
  // If emails are disabled, skip sending but return success
  if (!isEmailEnabled()) {
    log.info({ userId, email }, 'Email disabled - skipping email verification send');
    return { success: true, message: 'Email system disabled - verification skipped' };
  }

  try {
    // Generate verification token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification token to database
    await prisma.verification.create({
      data: {
        identifier: email,
        value: token,
        expiresAt,
      },
    });

    // Generate verification URL
    const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const unsubscribeUrl = `${APP_URL}/settings/notifications`;

    // Render email template
    const html = await render(
      React.createElement(EmailVerification, {
        userName: userName || email.split('@')[0],
        verificationUrl,
        unsubscribeUrl,
        expiresInHours: 24,
      })
    );

    // Send email
    const result = await sendEmail({
      to: email,
      subject: 'Verifica tu dirección de email - Blaniel',
      html,
    });

    if (result.success) {
      log.info({ userId, email }, 'Email verification sent successfully');
    } else {
      log.error({ userId, email, error: result.error }, 'Failed to send email verification');
    }

    return result;
  } catch (error: any) {
    log.error({ err: error, userId, email }, 'Error sending email verification');
    return {
      success: false,
      error: error.message || 'Failed to send verification email',
    };
  }
}

/**
 * Verify email token
 */
export async function verifyEmailToken(email: string, token: string) {
  try {
    // Find verification token
    const verification = await prisma.verification.findUnique({
      where: {
        identifier_value: {
          identifier: email,
          value: token,
        },
      },
    });

    if (!verification) {
      return { success: false, error: 'Invalid or expired verification token' };
    }

    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      // Delete expired token
      await prisma.verification.delete({
        where: {
          identifier_value: {
            identifier: email,
            value: token,
          },
        },
      });
      return { success: false, error: 'Verification token expired' };
    }

    // Update user email verified status
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    // Delete verification token
    await prisma.verification.delete({
      where: {
        identifier_value: {
          identifier: email,
          value: token,
        },
      },
    });

    log.info({ email }, 'Email verified successfully');

    return { success: true, message: 'Email verified successfully' };
  } catch (error: any) {
    log.error({ err: error, email }, 'Error verifying email token');
    return {
      success: false,
      error: error.message || 'Failed to verify email',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  email: string,
  ipAddress?: string,
  userAgent?: string
) {
  // If emails are disabled, skip sending but return success
  if (!isEmailEnabled()) {
    log.info({ email }, 'Email disabled - skipping password reset send');
    return { success: true, message: 'Email system disabled - password reset skipped' };
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that user doesn't exist for security reasons
      log.warn({ email }, 'Password reset requested for non-existent user');
      return { success: true, message: 'If the email exists, a reset link will be sent' };
    }

    // Generate reset token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await prisma.verification.create({
      data: {
        identifier: `password_reset:${email}`,
        value: token,
        expiresAt,
      },
    });

    // Generate reset URL
    const resetUrl = `${APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const unsubscribeUrl = `${APP_URL}/settings/notifications`;

    // Render email template
    const html = await render(
      React.createElement(PasswordReset, {
        userName: user.name || email.split('@')[0],
        resetUrl,
        unsubscribeUrl,
        expiresInHours: 1,
        ipAddress,
        userAgent,
      })
    );

    // Send email
    const result = await sendEmail({
      to: email,
      subject: 'Restablece tu contraseña - Blaniel',
      html,
    });

    if (result.success) {
      log.info({ email }, 'Password reset email sent successfully');
    } else {
      log.error({ email, error: result.error }, 'Failed to send password reset email');
    }

    return result;
  } catch (error: any) {
    log.error({ err: error, email }, 'Error sending password reset email');
    return {
      success: false,
      error: error.message || 'Failed to send password reset email',
    };
  }
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(email: string, token: string) {
  try {
    // Find reset token
    const verification = await prisma.verification.findUnique({
      where: {
        identifier_value: {
          identifier: `password_reset:${email}`,
          value: token,
        },
      },
    });

    if (!verification) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      // Delete expired token
      await prisma.verification.delete({
        where: {
          identifier_value: {
            identifier: `password_reset:${email}`,
            value: token,
          },
        },
      });
      return { success: false, error: 'Reset token expired' };
    }

    return { success: true, message: 'Token is valid' };
  } catch (error: any) {
    log.error({ err: error, email }, 'Error verifying password reset token');
    return {
      success: false,
      error: error.message || 'Failed to verify reset token',
    };
  }
}

/**
 * Delete password reset token after successful password reset
 */
export async function deletePasswordResetToken(email: string, token: string) {
  try {
    await prisma.verification.delete({
      where: {
        identifier_value: {
          identifier: `password_reset:${email}`,
          value: token,
        },
      },
    });
    log.info({ email }, 'Password reset token deleted');
  } catch (error: any) {
    log.error({ err: error, email }, 'Error deleting password reset token');
  }
}

/**
 * Send password changed notification
 */
export async function sendPasswordChangedNotification(
  email: string,
  ipAddress?: string
) {
  // If emails are disabled, skip sending
  if (!isEmailEnabled()) {
    log.info({ email }, 'Email disabled - skipping password changed notification');
    return { success: true, message: 'Email system disabled - notification skipped' };
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Generate URLs
    const loginUrl = `${APP_URL}/login`;
    const supportUrl = `${APP_URL}/support`;
    const unsubscribeUrl = `${APP_URL}/settings/notifications`;

    // Render email template
    const html = await render(
      React.createElement(PasswordChanged, {
        userName: user.name || email.split('@')[0],
        loginUrl,
        supportUrl,
        unsubscribeUrl,
        ipAddress,
        changedAt: new Date().toLocaleString('es-AR', {
          dateStyle: 'full',
          timeStyle: 'short',
        }),
      })
    );

    // Send email
    const result = await sendEmail({
      to: email,
      subject: 'Tu contraseña fue cambiada - Blaniel',
      html,
    });

    if (result.success) {
      log.info({ email }, 'Password changed notification sent successfully');
    } else {
      log.error({ email, error: result.error }, 'Failed to send password changed notification');
    }

    return result;
  } catch (error: any) {
    log.error({ err: error, email }, 'Error sending password changed notification');
    return {
      success: false,
      error: error.message || 'Failed to send password changed notification',
    };
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(email: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email already verified' };
    }

    // Delete old verification tokens for this email
    await prisma.verification.deleteMany({
      where: {
        identifier: email,
      },
    });

    // Send new verification email
    return await sendEmailVerification(user.id, email, user.name || undefined);
  } catch (error: any) {
    log.error({ err: error, email }, 'Error resending email verification');
    return {
      success: false,
      error: error.message || 'Failed to resend verification email',
    };
  }
}
