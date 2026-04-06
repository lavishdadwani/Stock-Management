// src/components/layout/AppLayout.js
import { View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AppHeader from "./AppHeader";
import AppDrawer from "./AppDrawer";
import { removeToken } from "../../utils/storage";

export default function AppLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await removeToken();
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      
      <AppHeader onMenuPress={() => setDrawerOpen(true)} />

      <AppDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
      />

      <View style={{ flex: 1 }}>
        {children}
      </View>

    </View>
  );
}