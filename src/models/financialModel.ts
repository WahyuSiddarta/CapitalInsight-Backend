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

  static async getFinanceVarsByKeys(
    keys: string[]
  ): Promise<Record<string, any>> {
    const client = await pool.connect();
    try {
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
      const query = `SELECT financial_key, financial_value FROM t_financial_variable WHERE financial_key IN (${placeholders})`;
      const res = await client.query(query, keys);

      return res.rows.reduce((acc: Record<string, any>, row: any) => {
        acc[row.financial_key] = row.financial_value;
        return acc;
      }, {});
    } finally {
      client.release();
    }
  }
}
