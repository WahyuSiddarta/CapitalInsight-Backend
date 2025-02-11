import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/userModel";
import { verifyRefreshToken } from "../helpers/tokenHelper";

const secretKey = process.env.JWT_SECRET || "your_secret_key";
const refreshSecretKey =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";
const pepper = process.env.PEPPER || "your_pepper";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findByEmail(email);
    if (
      user &&
      bcrypt.compareSync(password + user.salt + pepper, user.password)
    ) {
      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
        expiresIn: "1h",
      });
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        refreshSecretKey,
        { expiresIn: "7d" }
      );
      res.json({ token, refreshToken });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password + salt + pepper, 10);
  try {
    await UserModel.create({
      email,
      password: hashedPassword,
      salt,
    });

    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(201).json({ message: "User registered successfully" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      refreshSecretKey,
      { expiresIn: "7d" }
    );

    res
      .status(201)
      .json({ message: "User registered successfully", token, refreshToken });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.body;
  if (!token) {
    res.sendStatus(401);
    return;
  }

  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    res.sendStatus(403);
    return;
  }

  const { id, email } = decoded;
  const newToken = jwt.sign({ id, email }, secretKey, { expiresIn: "1h" });
  res.json({ token: newToken });
};
