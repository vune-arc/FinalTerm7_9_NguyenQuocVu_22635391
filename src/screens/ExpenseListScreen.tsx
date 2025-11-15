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
  Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // npm i @react-native-picker/picker
import {
  getAllExpenses,
  insertExpense,
  toggleExpensePaid,
  updateExpense,
  deleteExpense
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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

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

      if (editingId !== null) {
        updateExpense(editingId, {
          title: title.trim(),
          amount: amountNumber,
          category: category.trim() || null
        });
      } else {
        insertExpense({
          title: title.trim(),
          amount: amountNumber,
          category: category.trim() || null
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

  const handleTogglePaid = (id: number) => {
    toggleExpensePaid(id);
    loadExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category || "");
    setModalVisible(true);
  };

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa "${expense.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            deleteExpense(expense.id);
            loadExpenses();
          }
        }
      ]
    );
  };

  // Filtered list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchTitle = exp.title.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = categoryFilter ? exp.category === categoryFilter : true;
      return matchTitle && matchCategory;
    });
  }, [expenses, searchText, categoryFilter]);

  return (
    <View style={styles.container}>

      {/* Search Input */}
      <TextInput
        placeholder="Tìm kiếm theo tiêu đề..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      {/* Category Filter */}
      {/* <Picker
        selectedValue={categoryFilter}
        onValueChange={(value) => setCategoryFilter(value)}
        style={Platform.OS === "ios" ? styles.pickerIOS : styles.pickerAndroid}
      >
        <Picker.Item label="Tất cả danh mục" value={null} />
        <Picker.Item label="Cà phê" value="Cà phê" />
        <Picker.Item label="Ăn trưa" value="Ăn trưa" />
        <Picker.Item label="Lau nhà" value="Lau nhà" />
        <Picker.Item label="Đi chợ" value="Đi chợ" />
      </Picker> */}

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
                      { color: item.paid ? "green" : "red" }
                    ]}
                  >
                    {item.paid ? "Đã trả" : "Chưa trả"}
                  </Text>
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>

                {/* Delete Button */}
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

      {/* FAB */}
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
  searchInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 8 },
  pickerAndroid: { marginBottom: 12, height: 40 },
  pickerIOS: { marginBottom: 12 },

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

  // FAB
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

  // Edit button
  editBtn: {
    marginLeft: 10,
    backgroundColor: "#ffc107",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center"
  },
  editText: { color: "#fff", fontWeight: "700" },

  // Delete button
  deleteBtn: {
    marginLeft: 10,
    backgroundColor: "#dc3545",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center"
  },
  deleteText: { color: "#fff", fontWeight: "700" },

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
