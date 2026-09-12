import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import categoryRoutes from "../modules/category/category.routes";
import booksRoutes from "../modules/books/books.route";
import usersRoutes from "../modules/users/user.routes";
import borrowRoutes from "../modules/borrow/borrow.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import copiesRoutes from "../modules/copies/copy.routes";
import finesRoutes from "../modules/fines/fine.routes";
import authorRoutes from "../modules/authors/author.routes";
import publisherRoutes from "../modules/publishers/publisher.routes";
import reservationRoutes from "../modules/reservations/reservation.routes";
import settingsRoutes from "../modules/settings/settings.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      message: "Library Management System API",
      version: "1.0.0",
      endpoints: ["/auth", "/categories", "/books", "/users", "/borrow", "/dashboard"],
    },
  });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/books", booksRoutes);
router.use("/users", usersRoutes);
router.use("/borrow", borrowRoutes);
router.use("/authors", authorRoutes);
router.use("/publishers", publisherRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/copies", copiesRoutes);
router.use("/fines", finesRoutes);
router.use("/reservation", reservationRoutes);
router.use("/settings", settingsRoutes);


export default router;