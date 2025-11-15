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
export const insertExpense = (expense: {
  title: string;
  amount: number;
  category?: string | null;
  paid?: number;
}) => {
  if (!expense.title.trim()) throw new Error("Title không được để trống");
  if (isNaN(expense.amount) || expense.amount <= 0)
    throw new Error("Amount phải là số lớn hơn 0");

  const now = Date.now();
  db.runSync(
    `INSERT INTO expenses (title, amount, category, paid, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [expense.title, expense.amount, expense.category ?? null, expense.paid ?? 1, now]
  );
};
// Toggle trạng thái paid
export const toggleExpensePaid = (id: number) => {
  const expense = db.getFirstSync<{ paid: number }>(
    "SELECT paid FROM expenses WHERE id = ?",
    [id]
  );
  if (!expense) return;
  const newPaid = expense.paid === 1 ? 0 : 1;
  db.runSync("UPDATE expenses SET paid = ? WHERE id = ?", [newPaid, id]);
};
// Cập nhật expense
export const updateExpense = (id: number, {
  title,
  amount,
  category
}: { title: string; amount: number; category?: string | null }) => {
  db.runSync(
    "UPDATE expenses SET title = ?, amount = ?, category = ? WHERE id = ?",
    [title, amount, category || null, id]
  );
};
// Xóa expense
export const deleteExpense = (id: number) => {
  db.runSync("DELETE FROM expenses WHERE id = ?", [id]);
};

