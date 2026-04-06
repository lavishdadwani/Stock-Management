import { View, Text, Button, StyleSheet } from "react-native";

export default function Sidebar({ onLogout, onClose }) {
  return (
    <View style={styles.overlay}>
      
      <View style={styles.container}>
        <Text style={styles.name}>Lavish</Text>
        <Text style={styles.email}>user@email.com</Text>

        <View style={styles.divider} />

        <Button title="Logout" onPress={onLogout} />
        <Button title="Close" onPress={onClose} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    container: {
      width: 250,
      height: "100%",
      backgroundColor: "#fff",
      padding: 20,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
    },
    email: {
      color: "gray",
    },
    divider: {
      height: 1,
      backgroundColor: "#ddd",
      marginVertical: 15,
    },
  });