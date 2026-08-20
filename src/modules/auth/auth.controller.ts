import { clearRefreshCookie, setRefreshCookie } from "../../utils/jwt.js";
import * as authService from "./auth.service.js";
import { Request, Response, NextFunction } from "express";

const register = async (req: Request, res: Response) => {
  const user = await authService.register({ data: req.body });
  res.json({
    success: true,
    ...user,
  });
};

const login = async (req: Request, res: Response) => {
  const { refreshToken, ...response } = await authService.login({
    data: req.body,
  });
  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    data: response,
  });
};

const logout = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await authService.logout({ sessionId: req.auth.sessionId });
  clearRefreshCookie(res);
  res.status(204).end();
};

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  const { refreshToken: newRefreshToken, ...response } =
    await authService.refreshToken({ refreshToken });

  setRefreshCookie(res, newRefreshToken);
  res.json({
    success: true,
    data: response,
  });
};

const me = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = authService.me({
    user: req.user,
  });

  res.json({
    success: true,
    data: user,
  });
};

export { register, login, logout, refreshToken, me };
