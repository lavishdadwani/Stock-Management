// Single source of truth for colors actually used across the app.
// Keep `primary` in sync with the web admin app's Tailwind blue-600 (#2563eb)
// so both clients read as the same product.
export const lightColors = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#f59e0b",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6b7280",
  border: "#d1d5db",
  background: "#f3f6fb",
  surface: "#ffffff",
  filterPillBackground: "#eef2ff",
};

export const darkColors = {
  primary: "#3b82f6",
  primaryDark: "#60a5fa",
  success: "#22c55e",
  danger: "#f87171",
  warning: "#fbbf24",
  text: "#f3f4f6",
  textSecondary: "#d1d5db",
  textMuted: "#9ca3af",
  border: "#374151",
  background: "#0f172a",
  surface: "#1f2937",
  filterPillBackground: "#1e293b",
};

// Back-compat default for any call site that hasn't switched to useTheme() yet.
export const colors = lightColors;
export default colors;
