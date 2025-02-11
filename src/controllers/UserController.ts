import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import jwt from "jsonwebtoken";

export const getUserData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const decoded = jwt.decode(token) as { email: string } | null;
  if (!decoded) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const email = decoded.email;
  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ email: user.email });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
