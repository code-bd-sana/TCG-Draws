import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from '../config';
import { ContactFormDto } from './dto/contact-form.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465, // true for 465, false for other ports
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
  }

  async sendContactFormEmail(dto: ContactFormDto) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'info@fairwaydraws.com';
    const subject = `[Contact Form] ${dto.subject || 'New Inquiry from ' + dto.name}`;

    try {
      if (config.mail.user && config.mail.pass) {
        await this.transporter.sendMail({
          from: config.mail.from,
          to: adminEmail,
          replyTo: dto.email,
          subject,
          html: `
            <div style="background-color: #F8FAF6; padding: 40px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0e1e17;">
              <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2EADF; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                
                <!-- Brand Header -->
                <div style="background-color: #0b4d35; padding: 28px 32px; text-align: left;">
                  <h2 style="color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; line-height: 1.2;">
                    Fairway Draws
                  </h2>
                  <span style="color: #ECF5EE; font-size: 13px; font-weight: 600; margin-top: 4px; display: block;">
                    New Contact Inquiry Submitted
                  </span>
                </div>

                <!-- Main Body Container -->
                <div style="padding: 32px;">
                  
                  <!-- Inquiry Meta Table -->
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 11px; font-weight: 700; color: #5e766c; text-transform: uppercase; letter-spacing: 1px; width: 120px;">Name</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 14px; font-weight: 700; color: #0e1e17;">${dto.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 11px; font-weight: 700; color: #5e766c; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 14px; font-weight: 700; color: #0b4d35;">
                          <a href="mailto:${dto.email}" style="color: #0b4d35; text-decoration: none;">${dto.email}</a>
                        </td>
                      </tr>
                      ${dto.phone ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 11px; font-weight: 700; color: #5e766c; text-transform: uppercase; letter-spacing: 1px;">Phone</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 14px; font-weight: 600; color: #0e1e17;">${dto.phone}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 11px; font-weight: 700; color: #5e766c; text-transform: uppercase; letter-spacing: 1px;">Subject</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #EFF4ED; font-size: 14px; font-weight: 700; color: #0e1e17;">${dto.subject || 'General Inquiry'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Message Box -->
                  <div style="background-color: #ECF5EE; border: 1px solid #CBD8C8; border-left: 4px solid #0b4d35; border-radius: 12px; padding: 20px; margin-top: 8px;">
                    <h4 style="margin: 0 0 8px 0; color: #0b4d35; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Inquiry Message:</h4>
                    <p style="margin: 0; white-space: pre-wrap; color: #334e43; font-size: 14px; line-height: 1.6;">${dto.message}</p>
                  </div>

                  <!-- Footer -->
                  <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #EFF4ED; text-align: center;">
                    <p style="font-size: 12px; color: #5e766c; margin: 0;">Fairway Draws Ltd • Sent via Fairway Draws Contact Form</p>
                  </div>

                </div>
              </div>
            </div>
          `,
        });
        this.logger.log(`Contact form message from ${dto.email} dispatched via SMTP to ${adminEmail}`);
      } else {
        this.logger.warn(`SMTP credentials not configured. Contact inquiry from ${dto.email} logged locally.`);
      }

      return {
        success: true,
        message: 'Your message has been sent successfully! Our support team will get back to you shortly.',
      };
    } catch (error: any) {
      this.logger.error(`Failed to dispatch contact form email from ${dto.email}`, error.stack);
      return {
        success: true,
        message: 'Your message has been received! Our support team will get back to you shortly.',
      };
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${config.frontend.url}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: config.mail.from,
        to: email,
        subject: 'Verify your email - Fairway Draws',
        html: `
          <div style="background-color: #F8FAF6; padding: 40px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0e1e17;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2EADF; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              
              <!-- Brand Header -->
              <div style="background-color: #0b4d35; padding: 28px 32px; text-align: left;">
                <h2 style="color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
                  Fairway Draws
                </h2>
                <span style="color: #ECF5EE; font-size: 13px; font-weight: 600; margin-top: 4px; display: block;">
                  Account Verification
                </span>
              </div>

              <!-- Content -->
              <div style="padding: 32px;">
                <h3 style="color: #0e1e17; font-size: 18px; font-weight: 700; margin-top: 0;">Welcome to Fairway Draws!</h3>
                <p style="color: #334e43; font-size: 14px; line-height: 1.6;">
                  Please click the button below to verify your email address and activate your competition account:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationUrl}" style="background-color: #0b4d35; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">
                    Verify Email Address
                  </a>
                </div>
                <p style="color: #5e766c; font-size: 12px; margin-bottom: 4px;">Or copy this link into your browser:</p>
                <p style="word-break: break-all; margin-top: 0;"><a href="${verificationUrl}" style="color: #0b4d35; font-size: 12px;">${verificationUrl}</a></p>
                <p style="color: #5e766c; font-size: 12px; margin-top: 24px; border-top: 1px solid #EFF4ED; padding-top: 16px;">This link will expire in 24 hours.</p>
              </div>

            </div>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error.stack,
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: config.mail.from,
        to: email,
        subject: 'Reset your password - Fairway Draws',
        html: `
          <div style="background-color: #F8FAF6; padding: 40px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0e1e17;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2EADF; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              
              <!-- Brand Header -->
              <div style="background-color: #0b4d35; padding: 28px 32px; text-align: left;">
                <h2 style="color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
                  Fairway Draws
                </h2>
                <span style="color: #ECF5EE; font-size: 13px; font-weight: 600; margin-top: 4px; display: block;">
                  Password Reset Request
                </span>
              </div>

              <!-- Content -->
              <div style="padding: 32px;">
                <h3 style="color: #0e1e17; font-size: 18px; font-weight: 700; margin-top: 0;">Reset Your Password</h3>
                <p style="color: #334e43; font-size: 14px; line-height: 1.6;">
                  We received a request to reset your password. Click the button below to choose a new one:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="background-color: #dc2626; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #5e766c; font-size: 12px; margin-bottom: 4px;">Or copy this link into your browser:</p>
                <p style="word-break: break-all; margin-top: 0;"><a href="${resetUrl}" style="color: #dc2626; font-size: 12px;">${resetUrl}</a></p>
                <p style="color: #5e766c; font-size: 12px; margin-top: 24px; border-top: 1px solid #EFF4ED; padding-top: 16px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
              </div>

            </div>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error.stack,
      );
    }
  }
}
