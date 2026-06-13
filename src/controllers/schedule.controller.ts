import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { queueService } from "../services/queue.service";

const prisma = new PrismaClient();

/**
 * Schedule Email Controller
 */
export const scheduleEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      recipientEmail,
      subject,
      message,
      scheduledAt,
    } = req.body;

    /**
     * Validation
     */
    if (
      !recipientEmail ||
      !subject ||
      !message ||
      !scheduledAt
    ) {
      res.status(400).json({
        success: false,
        error: "All fields are required",
      });

      return;
    }

    /**
     * Convert local datetime correctly
     * Prevent UTC timezone conversion issue
     */
    const localDate = new Date(
      scheduledAt.replace(" ", "T")
    );

    /**
     * Save to PostgreSQL
     */
    const scheduledMessage =
      await prisma.scheduledMessage.create({
        data: {
          recipientEmail,
          subject,
          message,

          scheduledAt: localDate,

          status: "PENDING",
        },
      });

    console.log(
      "⏰ Scheduled Email Time:",
      localDate
    );

    /**
     * Add delayed BullMQ job
     */
    const queueResult =
      await queueService.scheduleEmailJob(
        scheduledMessage.id
      );

    if (!queueResult.success) {
      res.status(500).json({
        success: false,
        error: queueResult.error,
      });

      return;
    }

    /**
     * Success Response
     */
    res.status(201).json({
      success: true,
      message: "Email scheduled successfully",

      data: scheduledMessage,
    });
  } catch (error) {
    console.error(
      "❌ Schedule email error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to schedule email",
    });
  }
};