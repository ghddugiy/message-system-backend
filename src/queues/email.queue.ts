import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

/**
 * Email job data interface
 */
export interface EmailJobData {
  messageId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  scheduledAt: string;
}

/**
 * Create and configure BullMQ email queue
 */
export const createEmailQueue = (): Queue<EmailJobData> => {
  const emailQueue = new Queue<EmailJobData>('email-queue', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        count: 1000,
        age: 3600,
      },
      removeOnFail: {
        count: 5000,
        age: 24 * 3600,
      },
    },
  });

  emailQueue.on('error', (err) => {
    console.error('❌ Email queue error:', err);
  });

  console.log('✅ Email queue created successfully');

  return emailQueue;
};

// Export singleton instance
export const emailQueue = createEmailQueue();
