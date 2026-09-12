import { Router } from "express";
import * as fineController from "./fine.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/me", authenticate, fineController.getMine);
router.get("/", authenticate, requireRole("ADMIN"), fineController.getAll);
router.patch("/:id/pay", authenticate, requireRole("ADMIN"), fineController.pay);
router.patch("/:id/waive", authenticate, requireRole("ADMIN"), fineController.waive);

export default router;