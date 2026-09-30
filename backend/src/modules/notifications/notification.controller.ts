import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendTestEmailSchema } from "./notification.validation";
import { sendEmail } from "../../utils/email";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";

export const getMyNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page, perPage } = getPagination(req);
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.notification.count({ where: { userId: req.user!.userId } }),
  ]);
  sendSuccess(res, notifications, 200, buildMeta(page, perPage, total));
});

export const getAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page, perPage } = getPagination(req);
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.notification.count(),
  ]);
  sendSuccess(res, notifications, 200, buildMeta(page, perPage, total));
});

export const sendTestEmail = asyncHandler(async (req: Request, res: Response) => {
  const input = sendTestEmailSchema.parse(req.body);
  await sendEmail({ to: input.to, subject: input.subject, text: input.message });
  sendSuccess(res, { message: `Email sent to ${input.to}` });
});
