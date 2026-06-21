import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM', 'no-reply@nooremoon.global');
    this.frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const smtpUser = config.get<string>('SMTP_USER');
    this.configured = !!smtpUser;

    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'smtp.mailtrap.io'),
      port: config.get<number>('SMTP_PORT', 587),
      auth: smtpUser
        ? { user: smtpUser, pass: config.get<string>('SMTP_PASS') }
        : undefined,
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.configured) {
      this.logger.debug(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/verify-email?token=${token}`;
    await this.send(
      email,
      'Verify your email address',
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">Verify your email</h2>
        <p style="color:#555;line-height:1.6">Click the button below to verify your email address and activate your account.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;background:#111;color:#fff;text-decoration:none;padding:12px 28px;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase">Verify Email</a>
        <p style="color:#999;font-size:12px">If you didn't create this account, ignore this email.</p>
      </div>`,
    );
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    await this.send(
      email,
      'Reset your password',
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">Reset your password</h2>
        <p style="color:#555;line-height:1.6">We received a request to reset your password. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;background:#111;color:#fff;text-decoration:none;padding:12px 28px;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase">Reset Password</a>
        <p style="color:#999;font-size:12px">If you didn't request this, your account is safe — just ignore this email.</p>
      </div>`,
    );
  }

  async sendOtpEmail(email: string, code: string): Promise<void> {
    await this.send(
      email,
      'Your one-time login code',
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">Your login code</h2>
        <p style="color:#555">Use this code to sign in. It expires in 10 minutes.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:.2em;margin:24px 0;color:#111">${code}</div>
        <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>`,
    );
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send(
      email,
      'Welcome — your account is ready',
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">Welcome${name ? `, ${name}` : ''}!</h2>
        <p style="color:#555;line-height:1.6">Your account is verified and ready. Start browsing our latest collections.</p>
        <a href="${this.frontendUrl}" style="display:inline-block;margin:24px 0;background:#111;color:#fff;text-decoration:none;padding:12px 28px;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase">Shop Now</a>
      </div>`,
    );
  }
}
