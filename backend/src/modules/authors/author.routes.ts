import { Router } from "express";
import * as authorController from "./author.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, authorController.getAll);
router.get("/:id", authenticate, authorController.getById);
router.post("/", authenticate, requireRole("ADMIN"), authorController.create);
router.patch("/:id", authenticate, requireRole("ADMIN"), authorController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), authorController.remove);

export default router;