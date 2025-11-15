import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getAllExpenses } from "../db/db";
import { Expense } from "../types/expense";

export default function ExpenseListScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const data = getAllExpenses();
    setExpenses(data);
  };

  const formatMoney = (amount: number) =>
    amount.toLocaleString("vi-VN") + "đ";

  return (
    <View style={styles.container}>
      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có khoản chi tiêu nào.</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.category}>
                  {item.category || "Không có danh mục"}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.amount}>{formatMoney(item.amount)}</Text>
                <Text style={[styles.paid, { color: item.paid ? "green" : "red" }]}>
                  {item.paid ? "Đã trả" : "Chưa trả"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  item: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2
  },
  title: {
    fontSize: 16,
    fontWeight: "600"
  },
  category: {
    fontSize: 13,
    color: "#777"
  },
  amount: {
    fontSize: 16,
    fontWeight: "700"
  },
  paid: {
    marginTop: 4,
    fontSize: 13
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    color: "#666"
  }
});