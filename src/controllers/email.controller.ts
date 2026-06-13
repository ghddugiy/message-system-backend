import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

// Email interface
interface EmailRequest {
  recipientEmail: string;
  subject: string;
  message: string;
}

// Create Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Send email controller
export const sendEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientEmail, subject, message }: EmailRequest = req.body;

    // Validate request body
    if (!recipientEmail || !subject || !message) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: recipientEmail, subject, and message are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    // Check environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      res.status(500).json({
        success: false,
        error: 'Email configuration missing. Please check environment variables.',
      });
      return;
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: `"TimeDrop" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TimeDrop</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">Send messages across time</p>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>This message was scheduled through TimeDrop</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent: %s', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
};