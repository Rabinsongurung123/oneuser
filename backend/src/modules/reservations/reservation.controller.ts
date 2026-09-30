import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createReservationSchema } from "./reservation.validation";
import * as reservationService from "./reservation.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookId, userId } = createReservationSchema.parse(req.body);
  // Admins may create a reservation on behalf of a member
  const effectiveUserId = req.user!.role === "ADMIN" && userId ? userId : req.user!.userId;
  const reservation = await reservationService.createReservation(effectiveUserId, bookId);
  sendSuccess(res, reservation, 201);
});

export const cancel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reservation = await reservationService.cancelReservation(req.params.id as string, req.user!.userId, req.user!.role === "ADMIN");
  sendSuccess(res, reservation);
});

export const getMine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reservations = await reservationService.getMyReservations(req.user!.userId);
  sendSuccess(res, reservations);
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page, perPage } = getPagination(req);
  const [records, total] = await reservationService.getAllReservations(skip, take);
  sendSuccess(res, records, 200, buildMeta(page, perPage, total));
});