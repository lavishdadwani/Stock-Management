// src/components/layout/AppDrawer.js
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { clearAuth } from "../../utils/storage";

export default function AppDrawer({ visible, onClose, onLogout, user, onNavigate }) {
  if (!visible) return null;

  const name = user?.name || "—";
  const email = user?.email || "—";

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <View style={styles.drawer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.divider} />

        <TouchableOpacity onPress={() => onNavigate?.("/stock-transfer-history")}>
          <Text style={styles.link}>Stock Transfer History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate?.("/attendance-history")}>
          <Text style={styles.link}>Attendance History</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={() => onLogout()}
        >
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    zIndex: 999,
    elevation: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    width: 260,
    backgroundColor: "#fff",
    padding: 20,
    elevation: 13,
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
  link: {
    paddingVertical: 10,
    fontWeight: "700",
    color: "#111827",
  },
  logout: {
    color: "red",
    fontWeight: "bold",
    paddingTop: 10,
  },
  logoutAlt: {
    color: "#b91c1c",
    fontWeight: "700",
    paddingTop: 10,
  },
});