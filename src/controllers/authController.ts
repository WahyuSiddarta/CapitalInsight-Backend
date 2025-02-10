import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { postgresPool as pool } from "../db/index";
import { UserModel } from "../models/userModel";

const secretKey = process.env.JWT_SECRET || "your_secret_key";
const refreshSecretKey =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";
const pepper = process.env.PEPPER || "your_pepper";

interface CustomJwtPayload extends JwtPayload {
  id: number;
  email: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const client = await pool.connect();
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
  } finally {
    client.release();
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password + salt + pepper, 10);
  const client = await pool.connect();
  try {
    await UserModel.create({
      name,
      email,
      password: hashedPassword,
      salt,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    client.release();
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
  jwt.verify(token, refreshSecretKey, (err: any, decoded: any) => {
    if (err || !decoded) {
      res.sendStatus(403);
      return;
    }
    const { id, email } = decoded as CustomJwtPayload;
    const newToken = jwt.sign({ id, email }, secretKey, { expiresIn: "1h" });
    res.json({ token: newToken });
  });
};
