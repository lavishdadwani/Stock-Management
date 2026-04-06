// src/components/ui/CardButton.js
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CardButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    marginVertical: 10,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});