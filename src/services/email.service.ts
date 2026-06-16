import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

/**
 * Email Service
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    this.verifyConnection();
  }

  /**
   * Verify Gmail SMTP Connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();

      console.log(
        "✅ Gmail SMTP connected successfully"
      );
    } catch (error) {
      console.error(
        "❌ Gmail SMTP connection failed:",
        error
      );
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
      if (
        !process.env.GMAIL_USER ||
        !process.env.GMAIL_APP_PASSWORD
      ) {
        throw new Error(
          "Missing GMAIL_USER or GMAIL_APP_PASSWORD"
        );
      }

      console.log(
        "📧 Sending email to:",
        recipientEmail
      );

      const info =
        await this.transporter.sendMail({
          from: `"TimeDrop" <${process.env.GMAIL_USER}>`,
          to: recipientEmail,
          subject,
          html: this.generateEmailTemplate(
            subject,
            message
          ),
        });

      console.log(
        "✅ EMAIL SENT SUCCESSFULLY"
      );

      console.log(
        "📩 MESSAGE ID:",
        info.messageId
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(
        "❌ EMAIL SEND ERROR:",
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
          <h1 style="color:white;margin:0;">
            ⏳ TimeDrop
          </h1>

          <p
            style="
              color:rgba(255,255,255,0.8);
              margin-top:8px;
            "
          >
            Send messages across time
          </p>
        </div>

        <div style="padding:24px;">
          <h2>${subject}</h2>

          <p
            style="
              white-space:pre-wrap;
              line-height:1.8;
            "
          >
            ${message}
          </p>
        </div>

        <div
          style="
            padding:16px;
            text-align:center;
            border-top:1px solid #e5e7eb;
            font-size:12px;
            color:#9ca3af;
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