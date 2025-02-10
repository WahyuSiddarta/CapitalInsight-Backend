import { Request, Response } from "express";
import * as md from "../models";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await md.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
