import { Router } from "express";
import { getStats } from "./dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), getStats);

export default router;