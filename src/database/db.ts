import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";

export const db: SQLiteDatabase = openDatabaseSync("expenses.db");

export const initDB = () => {
  // Tạo bảng
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

  // Kiểm tra bảng có dữ liệu chưa
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM expenses"
  );

  if (row?.count === 0) {
    const now = Date.now();

    db.runSync(
      `INSERT INTO expenses (title, amount, category, paid, created_at)
       VALUES 
       (?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?)`,
      [
        "Cà phê", 30000, "Đồ uống", 1, now,
        "Ăn trưa", 50000, "Ăn uống", 1, now,
        "Gửi xe", 5000, "Khác", 1, now
      ]
    );

    console.log("✓ Seed sample expenses!");
  } else {
    console.log("✓ Bảng expenses đã có dữ liệu.");
  }
};
