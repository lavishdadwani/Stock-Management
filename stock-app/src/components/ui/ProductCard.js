// src/components/ui/ProductCard.js
import { View, Text, StyleSheet } from "react-native";

export default function ProductCard({ item }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{item.itemName}</Text>
      <Text>Qty: {item.quantity} {item.unit}</Text>
      <Text>Produced: {item.quantity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  name: { fontWeight: "bold" },
});