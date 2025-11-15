import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAllExpenses,
  insertExpense,
  updateExpense,
  toggleExpensePaid,
  deleteExpense,
  importExpensesFromAPI,
} from "../db/db";
import { Expense } from "../types/expense";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const loadExpenses = useCallback(() => {
    const data = getAllExpenses();
    setExpenses(data);
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filteredExpenses = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return expenses.filter((e) => e.title.toLowerCase().includes(text));
  }, [expenses, searchText]);

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const addExpense = useCallback((expense: { title: string; amount: number; category?: string }) => {
    insertExpense(expense);
    loadExpenses();
  }, [loadExpenses]);

  const editExpense = useCallback((id: number, expense: { title: string; amount: number; category?: string }) => {
    updateExpense(id, expense);
    loadExpenses();
  }, [loadExpenses]);

  const togglePaid = useCallback((id: number) => {
    toggleExpensePaid(id);
    loadExpenses();
  }, [loadExpenses]);

  const removeExpense = useCallback((id: number) => {
    deleteExpense(id);
    loadExpenses();
  }, [loadExpenses]);

  const importAPI = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    const result = await importExpensesFromAPI(url);
    setLoading(false);
    if (result.success) loadExpenses();
    else setError("Import thất bại. Kiểm tra API.");
  }, [loadExpenses]);

  const refresh = useCallback(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses: filteredExpenses,
    totalAmount,
    searchText,
    setSearchText,
    loading,
    error,
    addExpense,
    editExpense,
    togglePaid,
    removeExpense,
    importAPI,
    refresh,
  };
};
