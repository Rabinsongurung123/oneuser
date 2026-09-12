import { Router } from "express";
import * as copyController from "./copy.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/book/:bookId", authenticate, copyController.getForBook);
router.get("/:id", authenticate, copyController.getById);
router.post("/", authenticate, requireRole("ADMIN"), copyController.create);
router.patch("/:id", authenticate, requireRole("ADMIN"), copyController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), copyController.remove);

export default router;