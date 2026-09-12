import { Router } from "express";
import * as reservationController from "./reservation.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, reservationController.create);
router.get("/me", authenticate, reservationController.getMine);
router.patch("/:id/cancel", authenticate, reservationController.cancel);
router.get("/", authenticate, requireRole("ADMIN"), reservationController.getAll);

export default router;