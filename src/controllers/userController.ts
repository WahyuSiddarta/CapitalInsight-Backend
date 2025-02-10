import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = {};
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
