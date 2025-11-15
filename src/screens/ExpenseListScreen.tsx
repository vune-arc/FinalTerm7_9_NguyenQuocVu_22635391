import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { getAllExpenses, insertExpense, toggleExpensePaid } from "../db/db";
import { Expense } from "../types/expense";

export default function ExpenseListScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const data = getAllExpenses();
    setExpenses(data);
  };

  const formatMoney = (amount: number) =>
    amount.toLocaleString("vi-VN") + "đ";

  const handleSave = () => {
    try {
      if (!title.trim()) throw new Error("Title không được để trống");
      const amountNumber = Number(amount);
      if (isNaN(amountNumber) || amountNumber <= 0)
        throw new Error("Amount phải là số > 0");

      insertExpense({
        title: title.trim(),
        amount: amountNumber,
        category: category.trim() || null
      });

      setTitle("");
      setAmount("");
      setCategory("");
      setModalVisible(false);
      loadExpenses();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const handleTogglePaid = (id: number) => {
    toggleExpensePaid(id); // update SQLite
    loadExpenses(); // reload danh sách
  };

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
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleTogglePaid(item.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.category}>
                  {item.category || "Không có danh mục"}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.amount}>{formatMoney(item.amount)}</Text>
                <Text
                  style={[
                    styles.paid,
                    { color: item.paid ? "green" : "red" }
                  ]}
                >
                  {item.paid ? "Đã trả" : "Đang nợ"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Nút + ở góc phải dưới */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal thêm chi tiêu */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Thêm khoản chi tiêu</Text>

            <TextInput
              placeholder="Tiêu đề"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Số tiền"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              placeholder="Danh mục (tùy chọn)"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.save]}
                onPress={handleSave}
              >
                <Text style={styles.btnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2
  },
  title: { fontSize: 16, fontWeight: "600" },
  category: { fontSize: 13, color: "#777" },
  amount: { fontSize: 16, fontWeight: "700" },
  paid: { marginTop: 4, fontSize: 13 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },

  // Nút FAB
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#28a745",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10
  },
  fabText: { color: "#fff", fontSize: 30, fontWeight: "700" },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12
  },
  modalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
  cancel: { backgroundColor: "#ccc" },
  save: { backgroundColor: "#28a745" },
  btnText: { color: "#fff", fontWeight: "700" }
});
