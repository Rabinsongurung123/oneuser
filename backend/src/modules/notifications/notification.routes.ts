import { Router } from "express";
import { getMyNotifications, getAllNotifications, sendTestEmail } from "./notification.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/me", authenticate, getMyNotifications);
router.get("/", authenticate, requireRole("ADMIN"), getAllNotifications);
router.post("/test", authenticate, requireRole("ADMIN"), sendTestEmail);

export default router;
