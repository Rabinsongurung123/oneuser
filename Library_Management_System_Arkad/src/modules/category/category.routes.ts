import { Router } from "express";
import * as categoryController from "./category.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, categoryController.getAll);
router.get("/:id", authenticate, categoryController.getById);
router.post("/", authenticate, requireRole("ADMIN"), categoryController.create);
router.patch("/:id", authenticate, requireRole("ADMIN"), categoryController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), categoryController.remove);

export default router;