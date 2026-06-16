import dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { emailService } from "../services/email.service";
import { PrismaClient } from "@prisma/client";
import { EmailJobData } from "../queues/email.queue";

const prisma = new PrismaClient();

/**
 * Email worker to process scheduled email jobs
 */
export const createEmailWorker = (): Worker<EmailJobData> => {
  const emailWorker = new Worker<EmailJobData>(
    "email-queue",

    async (job: Job<EmailJobData>) => {
      const {
        messageId,
        recipientEmail,
        subject,
        message,
      } = job.data;

      console.log(
        `📧 Processing email ${messageId} to ${recipientEmail}`
      );

      try {
        /**
         * Send email
         */
        const result = await emailService.sendEmail(
          recipientEmail,
          subject,
          message
        );

        /**
         * If email sending failed,
         * throw error so BullMQ marks job as failed
         */
        if (!result.success) {
          throw new Error(
            result.error || "Email sending failed"
          );
        }

        /**
         * Update DB status
         */
        await prisma.scheduledMessage.update({
          where: {
            id: messageId,
          },
          data: {
            status: "SENT",
          },
        });

        console.log(
          `✅ Email sent successfully for ${messageId}`
        );

        return {
          success: true,
          messageId: result.messageId,
        };
      } catch (error) {
        console.error(
          `❌ Email failed for ${messageId}:`,
          error
        );

        /**
         * Update DB status
         */
        await prisma.scheduledMessage.update({
          where: {
            id: messageId,
          },
          data: {
            status: "FAILED",
          },
        });

        throw error;
      }
    },

    {
      connection: redisConnection,

      concurrency: 5,

      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  /**
   * Worker Events
   */
  emailWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(
      `❌ Job ${job?.id} failed:`,
      err.message
    );
  });

  emailWorker.on("error", (err) => {
    console.error("❌ Worker error:", err);
  });

  console.log("🚀 Email worker started");

  return emailWorker;
};

/**
 * Singleton Worker Instance
 */
export const emailWorker = createEmailWorker();