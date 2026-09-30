import prisma from "../../prisma/client";
import { sendEmail } from "../../utils/email";

interface SendNotificationInput {
  userId: string;
  type: "DUE_REMINDER" | "OVERDUE_ALERT" | "HOLD_READY";
  subject: string;
  message: string;
}

export async function sendNotification(input: SendNotificationInput) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) return null;

  const notification = await prisma.notification.create({
    data: { userId: input.userId, type: input.type, channel: "EMAIL", status: "QUEUED" },
  });

  try {
    await sendEmail({ to: user.email, subject: input.subject, text: input.message });
    return prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (err: any) {
    console.error(`Failed to send notification ${notification.id}:`, err.message);
    return prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED", errorMessage: err.message?.slice(0, 500) },
    });
  }
}
