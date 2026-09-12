import { Router } from "express";
import * as booksController from "./books.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

router.get("/", authenticate, booksController.getAll);
router.get("/search", booksController.search);
router.get("/category/:category", booksController.getByCategory);
router.get("/:id", authenticate, booksController.getById);
router.post("/", authenticate, requireRole("ADMIN"), upload.single("cover"), booksController.create);
router.patch("/:id", authenticate, requireRole("ADMIN"), booksController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), booksController.remove);
router.post("/:id/cover", authenticate, requireRole("ADMIN"), upload.single("cover"), booksController.uploadCover);

export default router;