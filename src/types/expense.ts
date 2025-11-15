export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string | null;
  paid: number;           // 1 = đã trả, 0 = chưa trả
  created_at: number;     // timestamp (ms)
}
