import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function requireRole(...roles: ("ADMIN" | "MEMBER" | "LIBRARIAN")[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have permission to perform this action" },
      });
    }
    next();
  };
}