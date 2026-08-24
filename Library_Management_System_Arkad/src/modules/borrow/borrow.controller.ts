import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { borrowBookSchema, returnBookSchema } from "./borrow.validation";
import * as borrowService from "./borrow.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";

export const borrow = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = borrowBookSchema.parse(req.body);
  const result = await borrowService.borrowBook(input, req.user!.userId, req.user!.role);
  sendSuccess(res, result, 201);
});

export const returnBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = returnBookSchema.parse(req.body);
  const result = await borrowService.returnBook(input.borrowId);
  sendSuccess(res, result);
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page, perPage } = getPagination(req);
  const { records, total } = await borrowService.getAllBorrowRecords(skip, take);
  sendSuccess(res, records, 200, buildMeta(page, perPage, total));
});

export const getStudentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const records = await borrowService.getBorrowHistoryForStudent(req.params.id as string);
  sendSuccess(res, records);
});

export const getCurrentBorrowedBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const studentId = req.params.id as string;
  const record = await borrowService.getCurrentBorrowedBook(studentId);
  sendSuccess(res, record); 
})