// src/components/ui/StockCard.js
import { View, Text, StyleSheet } from "react-native";

export default function StockCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "30%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    alignItems: "center",
  },
  title: { fontSize: 12, color: "gray" },
  value: { fontSize: 18, fontWeight: "bold" },
});