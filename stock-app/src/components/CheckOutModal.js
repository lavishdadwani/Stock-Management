import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import dashboardApi from "../api/dashboardApi";
import { Dropdown } from "react-native-element-dropdown";
import { PRODUCIBLE_ITEMS } from "../data/ProducibleItems";


export default function CheckOutModal({ visible, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);

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

  // 🎯 FILTER ITEMS BASED ON WIRE
  const producibleItemsForWire = PRODUCIBLE_ITEMS.filter(
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
    const selected = PRODUCIBLE_ITEMS.find((i) => i.value === form.itemName);

    if (!selected) return;

    const qty = Number(form.quantity) || 0;
    const used = qty * selected.wireKgPerPiece;

    setForm((prev) => ({
      ...prev,
      wireUsedQuantity: Number(used.toFixed(2)),
    }));
  }, [form.quantity, form.itemName]);

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
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Check OUT</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Wire Type */}
        <Text>Wire Used Type *</Text>

        <Dropdown
          style={styles.dropdown}
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
        <Text>Available (kg)</Text>
        <TextInput
          style={styles.input}
          value={String(form.wireAvailableQuantity)}
          editable={false}
        />

        {/* Used */}
        <Text>Used (kg)</Text>
        <TextInput
          style={styles.input}
          value={String(form.wireUsedQuantity)}
          editable={false}
        />

        {/* Item */}
        <Text>Item Produced *</Text>

        <Dropdown
          style={styles.dropdown}
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
        <Text>Quantity *</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form.quantity}
          onChangeText={(text) => setForm({ ...form, quantity: text })}
        />

        {/* Scrap */}
        <Text>Scrap (g) (Optional)</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setForm({ ...form, scrap: text })}
        />

        {/* Description */}
        <Text>Description (Optional)</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setForm({ ...form, description: text })}
        />

        {/* ERROR */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Check OUT</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  close: { fontSize: 22 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  btn: {
    backgroundColor: "red",
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
