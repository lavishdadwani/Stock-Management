// src/components/layout/AppLayout.js
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import AppHeader from "./AppHeader";
import AppDrawer from "./AppDrawer";
import authApi from "../../api/authApi";
import { getUser } from "../../utils/storage";
import { Ionicons } from "@expo/vector-icons";

export default function AppLayout({ children }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u = await getUser();
      setUser(u);
    };
    load();
  }, []);

  const initials = useMemo(() => {
    const name = user?.name || user?.email || "";
    const ch = String(name).trim().charAt(0).toUpperCase();
    return ch || "U";
  }, [user]);

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setDrawerOpen(false);
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader initials={initials} onMenuPress={() => setDrawerOpen(true)} />

      <AppDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        user={user}
        onNavigate={(path) => {
          setDrawerOpen(false);
          router.push(path);
        }}
      />

      <View style={{ flex: 1, paddingBottom: 62 }}>{children}</View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons name="home" size={22} color="#111827" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push("/stock-transfer-history")}
        >
          <Ionicons name="swap-horizontal" size={22} color="#111827" />
          <Text style={styles.navText}>Transfers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 8,
  },
  navBtn: {
    flex: 1,
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
    color: "#111827",
  },
});