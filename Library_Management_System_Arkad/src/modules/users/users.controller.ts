import { Request, Response } from "express";
import { createStudentSchema, updateStudentSchema } from "./users.validation";
import * as usersService from "./user.services";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const { skip, take, page, perPage } = getPagination(req);

  const { students, total } = await usersService.getAllStudents(search, skip, take);
  sendSuccess(res, students, 200, buildMeta(page, perPage, total));
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const student = await usersService.getStudentById(req.params.id as string);
  sendSuccess(res, student);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createStudentSchema.parse(req.body);
  const student = await usersService.createStudent(input);
  sendSuccess(res, student, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updateStudentSchema.parse(req.body);
  const student = await usersService.updateStudent(req.params.id as string, input);
  sendSuccess(res, student);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await usersService.deleteStudent(req.params.id as string);
  sendNoContent(res);
});