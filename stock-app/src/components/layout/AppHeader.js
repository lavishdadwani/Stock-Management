// src/components/layout/AppHeader.js
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AppHeader({ onMenuPress }) {
  return (
    <View style={styles.container}>
      
      <TouchableOpacity onPress={onMenuPress}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>L</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>Stock</Text>

      <View style={styles.right}>
        <Text style={styles.icon}>🔔</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  icon: {
    fontSize: 18,
  },
});