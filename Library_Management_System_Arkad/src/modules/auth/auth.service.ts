import bcrypt from "bcrypt";
import prisma from "../../prisma/client";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { ApiError } from "../../utils/apiError";
import { LoginInput } from "./auth.validation";

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw ApiError.unauthorized("No account found with this email");
  if (!user.isActive) throw ApiError.forbidden("This account has been disabled. Contact an administrator.");

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) throw ApiError.unauthorized("Incorrect password");

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function logout(refreshToken: string) {
  if (!refreshToken) throw ApiError.validation("refreshToken is required");
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function refresh(refreshToken: string) {
  if (!refreshToken) throw ApiError.validation("refreshToken is required");

  const stored = await prisma.refreshToken.findFirst({ where: { token: refreshToken } });
  if (!stored) throw ApiError.unauthorized("Invalid refresh token");
  if (stored.expiresAt < new Date()) throw ApiError.unauthorized("Refresh token expired");

  const payload = verifyRefreshToken(refreshToken);
  const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });

  return { accessToken };
}