import pool from "../db/postgres";

interface FinancialVariable {
  id: number;
  financial_value: number | null;
  description: string | null;
  financial_key: string;
  updated_at: Date | null;
}

export class FinancialModel {
  static async getFinanceVarByKey(
    financial_key: string
  ): Promise<FinancialVariable | null> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM t_financial_variable WHERE financial_key = $1",
        [financial_key]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }
}
