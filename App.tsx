import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { initDB } from "./src/db/db";
import ExpenseListScreen from "./src/screens/ExpenseListScreen";

export default function App() {
  useEffect(() => {
    initDB(); // Khởi tạo DB và seed mẫu (nếu lần đầu)
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expense Notes</Text>

      {/* Màn hình danh sách chi tiêu */}
      <View style={{ flex: 1, width: "100%" }}>
        <ExpenseListScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5"
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center"
  }
});
