import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

/**
 * Email Service
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();

    // Verify transporter on startup
    this.verifyConnection();
  }

  /**
   * Create Gmail Transporter
   */
  private createTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  /**
   * Verify Gmail SMTP Connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();

      console.log(
        "✅ Gmail SMTP connected successfully"
      );

      return true;
    } catch (error) {
      console.error(
        "❌ Gmail SMTP verification failed:",
        error
      );

      return false;
    }
  }

  /**
   * Send Email
   */
  async sendEmail(
    recipientEmail: string,
    subject: string,
    message: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      /**
       * Check ENV variables
       */
      if (
        !process.env.GMAIL_USER ||
        !process.env.GMAIL_APP_PASSWORD
      ) {
        throw new Error(
          "❌ Missing Gmail credentials in .env"
        );
      }

      console.log(
        "📧 Sending email to:",
        recipientEmail
      );

      /**
       * Send Mail
       */
      const info = await this.transporter.sendMail({
        from: `"TimeDrop" <${process.env.GMAIL_USER}>`,

        to: recipientEmail,

        subject,

        text: message,

        html: this.generateEmailTemplate(
          subject,
          message
        ),
      });

      console.log(
        `✅ EMAIL SENT SUCCESSFULLY`
      );

      console.log(
        `📩 MESSAGE ID: ${info.messageId}`
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(
        `❌ EMAIL SEND ERROR:`,
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Email Error",
      };
    }
  }

  /**
   * HTML EMAIL TEMPLATE
   */
  private generateEmailTemplate(
    subject: string,
    message: string
  ): string {
    return `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        "
      >
        <div
          style="
            background: linear-gradient(135deg,#2563eb,#7c3aed);
            padding: 24px;
            text-align: center;
          "
        >
          <h1 style="color: white; margin:0;">
            ⏳ TimeDrop
          </h1>

          <p
            style="
              color: rgba(255,255,255,0.8);
              margin-top: 8px;
            "
          >
            Send messages across time
          </p>
        </div>

        <div style="padding: 24px;">
          <h2 style="color:#111827;">
            ${subject}
          </h2>

          <p
            style="
              color:#374151;
              line-height:1.8;
              white-space:pre-wrap;
            "
          >
            ${message}
          </p>
        </div>

        <div
          style="
            padding:16px;
            text-align:center;
            font-size:12px;
            color:#9ca3af;
            border-top:1px solid #e5e7eb;
          "
        >
          Scheduled with TimeDrop
        </div>
      </div>
    `;
  }
}

/**
 * Singleton Instance
 */
export const emailService =
  new EmailService();

/**
 * Named Export
 */
export const sendEmail =
  emailService.sendEmail.bind(emailService);