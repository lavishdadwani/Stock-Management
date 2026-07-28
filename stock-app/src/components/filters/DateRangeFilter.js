import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";

const DEFAULT_MODES = [
  { value: "month", label: "Monthly" },
  { value: "range", label: "Date range" },
];

const MONTH_OPTIONS = [
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
  label: String(y),
  value: String(y),
}));

/**
 * Shared month/date-range filter used by Dashboard, Attendance History, and
 * Stock Transfer History - previously copy-pasted (with drifting hardcoded
 * year lists) across all three screens.
 */
export default function DateRangeFilter({
  mode,
  onModeChange,
  modes = DEFAULT_MODES,
  month,
  onMonthChange,
  year,
  onYearChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const dropdownThemeProps = {
    style: styles.dropdown,
    containerStyle: { backgroundColor: colors.surface, borderColor: colors.border },
    placeholderStyle: { color: colors.textMuted },
    selectedTextStyle: { color: colors.text },
    itemTextStyle: { color: colors.text },
    itemContainerStyle: { backgroundColor: colors.surface },
    activeColor: colors.filterPillBackground,
  };

  return (
    <View>
      <View style={styles.filterRow}>
        {modes.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.filterPill, mode === m.value && styles.filterPillActive]}
            onPress={() => onModeChange(m.value)}
          >
            <Text style={[styles.filterPillText, mode === m.value && styles.filterPillTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "month" ? (
        <View style={styles.filterControls}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Month</Text>
            <Dropdown
              {...dropdownThemeProps}
              data={MONTH_OPTIONS}
              labelField="label"
              valueField="value"
              value={month}
              placeholder="Select month"
              onChange={(item) => onMonthChange(item.value)}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ width: 120 }}>
            <Text style={styles.label}>Year</Text>
            <Dropdown
              {...dropdownThemeProps}
              data={YEAR_OPTIONS}
              labelField="label"
              valueField="value"
              value={year}
              placeholder="Select year"
              onChange={(item) => onYearChange(item.value)}
            />
          </View>
        </View>
      ) : null}

      {mode === "range" ? (
        <View style={styles.filterControls}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Start date</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={onStartDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>End date</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={onEndDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    filterRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
    filterPill: {
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md + 2,
      borderRadius: 999,
      backgroundColor: colors.filterPillBackground,
    },
    filterPillActive: { backgroundColor: colors.primary },
    filterPillText: { ...typography.bodyBold, color: colors.textSecondary },
    filterPillTextActive: { color: "#fff" },
    filterControls: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: spacing.md,
    },
    label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.sm,
      borderRadius: 10,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm + 2,
      borderRadius: 10,
      height: 44,
      backgroundColor: colors.surface,
    },
  });
