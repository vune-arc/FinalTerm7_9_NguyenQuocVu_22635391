import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";

export const db: SQLiteDatabase = openDatabaseSync("expenses.db");

// Tạo bảng nếu chưa có
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

  console.log("SQLite: Bảng expenses đã được khởi tạo.");
};
