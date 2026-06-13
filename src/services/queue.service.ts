import { PrismaClient } from '@prisma/client';
import { emailQueue, EmailJobData } from '../queues/email.queue';

const prisma = new PrismaClient();

/**
 * Queue service for scheduling delayed email jobs
 */
export class QueueService {
  /**
   * Schedule a delayed email job
   */
  async scheduleEmailJob(
    messageId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Fetch message from database
      const message = await prisma.scheduledMessage.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new Error(
          `Scheduled message with id ${messageId} not found`
        );
      }

      // Calculate delay
      const scheduledTime = new Date(message.scheduledAt).getTime();
      const currentTime = Date.now();
      const delay = scheduledTime - currentTime;

      // Job payload
      const jobData: EmailJobData = {
        messageId: message.id,
        recipientEmail: message.recipientEmail,
        subject: message.subject,
        message: message.message,
        scheduledAt: message.scheduledAt.toISOString(),
      };

      if (delay <= 0) {
        console.log(
          `⚡ Sending email immediately for message ${messageId}`
        );

        await emailQueue.add('send-email', jobData, {
          jobId: messageId,
          delay: 0,
        });
      } else {
        console.log(
          `⏰ Scheduling delayed email for message ${messageId}`
        );

        await emailQueue.add('send-email', jobData, {
          jobId: messageId,
          delay,
        });
      }

      return { success: true };
    } catch (error) {
      console.error(
        `❌ Error scheduling email job for message ${messageId}:`,
        error
      );

      // Update status to FAILED
      await prisma.scheduledMessage.update({
        where: { id: messageId },
        data: { status: 'FAILED' },
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to schedule email job',
      };
    }
  }

  /**
   * Queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] =
      await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount(),
        emailQueue.getDelayedCount(),
      ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }

  /**
   * Remove job from queue
   */
  async removeJob(messageId: string): Promise<boolean> {
    try {
      const job = await emailQueue.getJob(messageId);

      if (job) {
        await job.remove();

        console.log(`🗑️ Removed job ${messageId}`);

        return true;
      }

      return false;
    } catch (error) {
      console.error(
        `❌ Error removing job ${messageId}:`,
        error
      );

      return false;
    }
  }
}

// Singleton export
export const queueService = new QueueService();