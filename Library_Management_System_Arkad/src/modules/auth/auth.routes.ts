import { Router } from "express";
import { loginHandler, logoutHandler, refreshHandler } from "./auth.controller";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "auth apge" });
});


router.post("/login", loginHandler);
router.post("/logout", logoutHandler);
router.post("/refresh", refreshHandler);

export default router;