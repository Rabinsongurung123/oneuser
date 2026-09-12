import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), getSettings);
router.patch("/", authenticate, requireRole("ADMIN"), updateSettings);

export default router;