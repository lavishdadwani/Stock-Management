import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import dashboardApi from "../api/dashboardApi";
import producibleItemsApi from "../api/producibleItemsApi";
import { Dropdown } from "react-native-element-dropdown";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useTheme } from "../context/ThemeContext";


export default function CheckOutModal({ visible, onClose, onSubmit }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(false);
  const [producibleItems, setProducibleItems] = useState([]);

  const [form, setForm] = useState({
    wireUsedType: "",
    wireAvailableQuantity: 0,
    wireUsedQuantity: 0,
    itemName: "",
    quantity: "",
    scrap: "",
    description: "",
  });

  const [error, setError] = useState("");

  const dropdownThemeProps = {
    style: styles.dropdown,
    containerStyle: { backgroundColor: colors.surface, borderColor: colors.border },
    placeholderStyle: { color: colors.textMuted },
    selectedTextStyle: { color: colors.text },
    itemTextStyle: { color: colors.text },
    itemContainerStyle: { backgroundColor: colors.surface },
    activeColor: colors.filterPillBackground,
  };

  // 🎯 FETCH PRODUCIBLE ITEM CATALOG (admin-managed)
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    (async () => {
      const res = await producibleItemsApi.getProducibleItems();
      if (!cancelled && res.ok) {
        const items = (res.data?.data || []).map((item) => ({
          value: item.itemName,
          label: item.itemName,
          itemName: item.itemName,
          wireUsedType: item.wireUsedType,
          wireKgPerPiece: item.wireKgPerPiece,
        }));
        setProducibleItems(items);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  // 🎯 FILTER ITEMS BASED ON WIRE
  const producibleItemsForWire = producibleItems.filter(
    (i) => i.wireUsedType === form.wireUsedType
  );

  const getSelectedProducedItem = (itemName) =>
  producibleItemsForWire.find(
    (i) => i.itemName === itemName || i.value === itemName
  ) || null;

  // 🎯 FETCH AVAILABLE STOCK
  useEffect(() => {
    if (!form.wireUsedType) return;

    const fetchStock = async () => {
      const res = await dashboardApi.getStockTransferQuantities({
        wire: form.wireUsedType,
      });

      if (res.ok) {
        const data = res.data.data;

        const available =
          form.wireUsedType === "aluminium"
            ? data.aluminium?.quantity
            : data.copper?.quantity;

        setForm((prev) => ({
          ...prev,
          wireAvailableQuantity: available || 0,
        }));
      }
    };

    fetchStock();
  }, [form.wireUsedType]);

  // 🎯 AUTO CALCULATE WIRE USED
  useEffect(() => {
    const selected = getSelectedProducedItem(form.itemName);

    if (!selected) {
      if (form.wireUsedQuantity !== 0) {
        setForm((prev) => ({
          ...prev,
          wireUsedQuantity: 0,
        }));
      }
      return;
    }

    const pieces = Number(form.quantity) || 0;
    const nextUsed = Number(
      (pieces * selected.wireKgPerPiece).toFixed(2)
    );

    if (form.wireUsedQuantity !== nextUsed) {
      setForm((prev) => ({
        ...prev,
        wireUsedQuantity: nextUsed,
      }));
    }
  }, [form.itemName, form.quantity]);

  useEffect(() => {
    const used = Number(form.wireUsedQuantity) || 0;
    const available = Number(form.wireAvailableQuantity) || 0;

    if (used > available) {
      setError("Wire used quantity cannot be greater than available stock");
    } else {
      setError("");
    }
  }, [form.wireUsedQuantity, form.wireAvailableQuantity]);

  // 🚀 SUBMIT
  const handleSubmit = async () => {
    if (!form.wireUsedType) return setError("Wire type required");
    if (!form.itemName) return setError("Item required");
    if (!form.quantity || Number(form.quantity) <= 0) return setError("Quantity must be greater than zero");
    if (form.wireUsedQuantity > form.wireAvailableQuantity) {
      return setError("Wire used quantity cannot be greater than available stock");
    }

    setError("");
    setLoading(true);

    const payload = {
      wireUsedType: form.wireUsedType,
      wireUsedQuantity: parseFloat(form.wireUsedQuantity),
      itemProduced: {
        itemName: form.itemName,
        quantity: parseFloat(form.quantity),
        unit: "pieces",
      },
      scrapQuantity: form.scrap ? parseFloat(form.scrap) / 1000 : null,
      description: form.description || null,
    };

    const res = await onSubmit(payload);

    if (!res?.ok) {
      setError(res?.data?.message || "Checkout failed");
    } else {
      setForm({
        wireUsedType: "",
        wireAvailableQuantity: 0,
        wireUsedQuantity: 0,
        itemName: "",
        quantity: "",
        scrap: "",
        description: "",
      });
      onClose();
    }

    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Check OUT</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Wire Type */}
            <Text style={styles.label}>Wire Used Type *</Text>

            <Dropdown
              {...dropdownThemeProps}
              data={[
                { label: "Aluminium", value: "aluminium" },
                { label: "Copper", value: "copper" },
              ]}
              labelField="label"
              valueField="value"
              placeholder="Select Wire Type"
              value={form.wireUsedType}
              onChange={(item) =>
                setForm({
                  ...form,
                  wireUsedType: item.value,
                  itemName: "", // reset item
                  wireUsedQuantity: 0,
                })
              }
            />

            {/* Available */}
            <Text style={styles.label}>Available (kg)</Text>
            <TextInput
              style={styles.input}
              value={String(form.wireAvailableQuantity)}
              editable={false}
            />

            {/* Used */}
            <Text style={styles.label}>Used (kg)</Text>
            <TextInput
              style={styles.input}
              value={String(form.wireUsedQuantity)}
              editable={false}
            />

            {/* Item */}
            <Text style={styles.label}>Item Produced *</Text>

            <Dropdown
              {...dropdownThemeProps}
              data={producibleItemsForWire.map((i) => ({
                label: i.label,
                value: i.value,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Item"
              value={form.itemName}
              onChange={(item) =>
                setForm({
                  ...form,
                  itemName: item.value,
                })
              }
              disable={!form.wireUsedType}
            />

            {/* Quantity */}
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.quantity}
              onChangeText={(text) => setForm({ ...form, quantity: text })}
              placeholderTextColor={colors.textMuted}
            />

            {/* Scrap */}
            <Text style={styles.label}>Scrap (g) (Optional)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={(text) => setForm({ ...form, scrap: text })}
              placeholderTextColor={colors.textMuted}
            />

            {/* Description */}
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholderTextColor={colors.textMuted}
            />

            {/* ERROR */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff" }}>Check OUT</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: spacing.xl, backgroundColor: colors.background },
    scrollContent: { paddingBottom: spacing.xl },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.lg,
    },
    title: { ...typography.h1, fontSize: 20, color: colors.text },
    label: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: 10,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    btn: {
      backgroundColor: colors.danger,
      paddingVertical: spacing.lg,
      alignItems: "center",
      borderRadius: 10,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    error: {
      ...typography.body,
      color: colors.danger,
      marginBottom: spacing.md,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
    },
  });
