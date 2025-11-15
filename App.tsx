import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { initDB } from "./src/database/db";

export default function App() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Expense Notes App</Text>
    </View>
  );
}
