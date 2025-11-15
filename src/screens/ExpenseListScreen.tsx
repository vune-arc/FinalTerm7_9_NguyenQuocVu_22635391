import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  getAllExpenses,
  insertExpense,
  updateExpense,
  toggleExpensePaid,
  deleteExpense,
  importExpensesFromAPI,
} from "../db/db";
import { Expense } from "../types/expense";

export default function ExpenseListScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState("");

  // Import API
  const [loadingImport, setLoadingImport] = useState(false);
  const [errorImport, setErrorImport] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const data = getAllExpenses();
    setExpenses(data);
  };

  const filteredExpenses = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return expenses.filter((e) => e.title.toLowerCase().includes(text));
  }, [expenses, searchText]);

  const formatMoney = (amount: number) =>
    amount.toLocaleString("vi-VN") + "đ";

  // Save / Add
  const handleSave = () => {
    try {
      if (!title.trim()) throw new Error("Title không được để trống");
      const amountNumber = Number(amount);
      if (isNaN(amountNumber) || amountNumber <= 0)
        throw new Error("Amount phải là số > 0");

      if (editingId !== null) {
        updateExpense(editingId, {
          title: title.trim(),
          amount: amountNumber,
          category: category.trim() || null,
        });
      } else {
        insertExpense({
          title: title.trim(),
          amount: amountNumber,
          category: category.trim() || null,
        });
      }

      setTitle("");
      setAmount("");
      setCategory("");
      setEditingId(null);
      setModalVisible(false);
      loadExpenses();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  };

  // Toggle Paid
  const handleTogglePaid = (id: number) => {
    toggleExpensePaid(id);
    loadExpenses();
  };

  // Edit
  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category || "");
    setModalVisible(true);
  };

  // Delete
  const handleDelete = (expense: Expense) => {
    deleteExpense(expense.id);
    loadExpenses();
  };

  // Import from API
  const handleImport = async () => {
    setLoadingImport(true);
    setErrorImport(null);
    const result = await importExpensesFromAPI(
      "https://67c83e5f0acf98d070859495.mockapi.io/api/v1/NguyenQuocVu_22635391"
    );
    setLoadingImport(false);
    if (result.success) loadExpenses();
    else setErrorImport("Import thất bại. Kiểm tra API.");
  };

  return (
    <View style={styles.container}>
      {/* Search & Import */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="Tìm kiếm..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
          <Text style={styles.importText}>Import</Text>
        </TouchableOpacity>
      </View>

      {loadingImport && <ActivityIndicator size="large" color="#28a745" />}
      {errorImport && <Text style={styles.errorText}>{errorImport}</Text>}

      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có khoản chi tiêu nào.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
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

              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.amount}>{formatMoney(item.amount)}</Text>
                  <Text
                    style={[
                      styles.paid,
                      { color: item.paid ? "green" : "red" },
                    ]}
                  >
                    {item.paid ? "Đã trả" : "Chưa trả"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Nút + */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingId(null);
          setTitle("");
          setAmount("");
          setCategory("");
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>
              {editingId !== null ? "Chỉnh sửa khoản chi" : "Thêm khoản chi"}
            </Text>

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
  topBar: { flexDirection: "row", marginBottom: 10 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  importBtn: {
    marginLeft: 10,
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 6,
  },
  importText: { color: "#fff", fontWeight: "700" },
  errorText: { color: "red", marginVertical: 6 },

  item: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "600" },
  category: { fontSize: 13, color: "#777" },
  amount: { fontSize: 16, fontWeight: "700" },
  paid: { marginTop: 4, fontSize: 13 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },

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
    zIndex: 10,
  },
  fabText: { color: "#fff", fontSize: 30, fontWeight: "700" },

  editBtn: {
    marginLeft: 10,
    backgroundColor: "#ffc107",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center",
  },
  editText: { color: "#fff", fontWeight: "700" },

  deleteBtn: {
    marginLeft: 10,
    backgroundColor: "#dc3545",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center",
  },
  deleteText: { color: "#fff", fontWeight: "700" },

  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
  cancel: { backgroundColor: "#ccc" },
  save: { backgroundColor: "#28a745" },
  btnText: { color: "#fff", fontWeight: "700" },
});
