import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const refreshSecretKey =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";

export const authenticateRefreshJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    jwt.verify(token, refreshSecretKey, (err, user: any) => {
      if (err) {
        return res.sendStatus(403);
      }
      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
