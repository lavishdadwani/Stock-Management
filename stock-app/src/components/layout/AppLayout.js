// src/components/layout/AppLayout.js
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import AppHeader from "./AppHeader";
import AppDrawer from "./AppDrawer";
import authApi from "../../api/authApi";
import { getUser } from "../../utils/storage";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { shadow } from "../../constants/shadow";
import { typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";

export default function AppLayout({ children }) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.safeArea}>
          <AppHeader
            initials={initials}
            onMenuPress={() => setDrawerOpen(true)}
          />

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

          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              paddingBottom: 56 + insets.bottom, // dynamic spacing
            }}
          >
            {children}
          </View>

          <View
            style={[
              styles.bottomNav,
              {
                paddingBottom: insets.bottom,
                height: 56 + insets.bottom,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.push("/dashboard")}
            >
              <Ionicons name="home" size={22} color={colors.text} />
              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.push("/stock-transfer-history")}
            >
              <Ionicons name="swap-horizontal" size={22} color={colors.text} />
              <Text style={styles.navText}>Transfers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    bottomNav: {
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      ...shadow(8),
    },
    navBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    navText: {
      ...typography.caption,
      marginTop: 2,
      fontWeight: "600",
      color: colors.text,
    },
  });
