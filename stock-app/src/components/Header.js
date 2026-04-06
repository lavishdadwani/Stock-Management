import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Header({ onMenuPress }) {
  return (
    <View style={styles.container}>
      
      {/* Left - Avatar */}
      <TouchableOpacity onPress={onMenuPress}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>L</Text>
        </View>
      </TouchableOpacity>

      {/* Center - App Name */}
      <Text style={styles.title}>Stock</Text>

      {/* Right - Notification */}
      <Text style={styles.icon}>🔔</Text>

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
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
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

import React from 'react'

