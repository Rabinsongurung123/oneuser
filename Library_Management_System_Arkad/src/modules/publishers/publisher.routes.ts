import { Router } from "express";
import * as publisherController from "./publisher.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, publisherController.getAll);
router.get("/:id", authenticate, publisherController.getById);
router.post("/", authenticate, requireRole("ADMIN"), publisherController.create);
router.patch("/:id", authenticate, requireRole("ADMIN"), publisherController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), publisherController.remove);

export default router;