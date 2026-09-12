import { Router } from "express";
import * as borrowController from "./borrow.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, borrowController.borrow);
router.post("/return", authenticate, borrowController.returnBook);
router.get("/", authenticate, requireRole("ADMIN"), borrowController.getAll);
router.get("/student/:id/history", authenticate, borrowController.getStudentHistory);
router.get("/student/:id/current", authenticate, borrowController.getCurrentBorrowedBook);

export default router;