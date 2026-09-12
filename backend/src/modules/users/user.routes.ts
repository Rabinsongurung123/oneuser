import { Router } from "express";
import * as usersController from "./users.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), usersController.getAll);
router.get("/:id", authenticate, usersController.getById);
router.post("/", authenticate, requireRole("ADMIN"), usersController.create);
router.patch("/:id", authenticate, usersController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), usersController.remove);

export default router;