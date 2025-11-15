import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";
import { Expense } from "../types/expense";

export const db: SQLiteDatabase = openDatabaseSync("expenses.db");

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      paid INTEGER DEFAULT 1,
      created_at INTEGER
    );
  `);

  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM expenses"
  );

  if (row?.count === 0) {
    const now = Date.now();

    db.runSync(
      `INSERT INTO expenses (title, amount, category, paid, created_at)
       VALUES 
       (?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?)`,
      [
        "Cà phê", 30000, "Đồ uống", 1, now,
        "Ăn trưa", 50000, "Ăn uống", 1, now,
      ]
    );
  }
};

// Lấy tất cả expenses
export const getAllExpenses = (): Expense[] => {
  return db.getAllSync<Expense>(
    "SELECT * FROM expenses ORDER BY created_at DESC"
  );
};
