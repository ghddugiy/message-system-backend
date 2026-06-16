import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

/**
 * Resend Client
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email Service
 */
export class EmailService {
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
      if (!process.env.RESEND_API_KEY) {
        throw new Error(
          "Missing RESEND_API_KEY environment variable"
        );
      }

      console.log("📧 Sending email to:", recipientEmail);

      console.log(
        "🔑 RESEND KEY EXISTS:",
        !!process.env.RESEND_API_KEY
      );

      const { data, error } = await resend.emails.send({
        from: "TimeDrop <onboarding@resend.dev>",
        to: recipientEmail,
        subject,
        html: this.generateEmailTemplate(
          subject,
          message
        ),
      });

      if (error) {
        console.error(
          "❌ RESEND API ERROR:",
          error
        );

        return {
          success: false,
          error: JSON.stringify(error),
        };
      }

      console.log(
        "✅ EMAIL SENT SUCCESSFULLY"
      );

      console.log(
        "📩 MESSAGE ID:",
        data?.id
      );

      return {
        success: true,
        messageId: data?.id,
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