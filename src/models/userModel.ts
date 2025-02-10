import pool from "../db/postgres";

interface User {
  id?: number;
  email: string;
  password: string;
  salt?: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(user: User): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO users (email, password, salt) VALUES ($1, $2, $3)",
        [user.email, user.password, user.salt]
      );
    } finally {
      client.release();
    }
  }
}
