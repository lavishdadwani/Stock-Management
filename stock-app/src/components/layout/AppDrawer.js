// src/components/layout/AppDrawer.js
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AppDrawer({ visible, onClose, onLogout }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      
      {/* Close area */}
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      {/* Drawer */}
      <View style={styles.drawer}>
        <Text style={styles.name}>Lavish</Text>
        <Text style={styles.email}>user@email.com</Text>

        <View style={styles.divider} />

        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    width: 260,
    backgroundColor: "#fff",
    padding: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    color: "gray",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  logout: {
    color: "red",
    fontWeight: "bold",
  },
});