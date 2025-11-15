import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { insertExpense } from "../db/db";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddExpenseModal({ visible, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

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

      onSaved(); // reload danh sách
      onClose(); // đóng modal
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Thêm khoản chi tiêu</Text>

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

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.btnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.save]} onPress={handleSave}>
              <Text style={styles.btnText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12
  },
  header: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
  cancel: { backgroundColor: "#ccc" },
  save: { backgroundColor: "#28a745" },
  btnText: { color: "#fff", fontWeight: "700" }
});
