import { postgresPool as pool } from "../db/index";

interface Product {
  id: number;
  name: string;
  price: number;
  example: string | null;
}

export const getProducts = async (): Promise<Product[]> => {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM products");
    return res.rows.map((row) => ({
      id: row.id,
      name: row.name || "Unknown", // handle null value for name
      price: row.price,
      example: row.example, // handle null value for example
    }));
  } finally {
    client.release();
  }
};
