import { useSelector } from 'react-redux';

// Fixed per-entity color assignment — never cycled or reassigned by rank,
// so the same material always reads as the same color across every chart.
// Light/dark are each their own validated step per the dataviz skill's
// palette, not an automatic flip of the light values.
const MATERIAL_COLORS_LIGHT = {
  aluminium: '#2a78d6', // blue
  copper: '#eb6834', // orange
  scrap: '#4a3aa7' // violet
};

const MATERIAL_COLORS_DARK = {
  aluminium: '#3987e5',
  copper: '#d95926',
  scrap: '#9085e9'
};

const SEQUENTIAL_HUE_LIGHT = '#2a78d6';
const SEQUENTIAL_HUE_DARK = '#3987e5';

const CHART_TEXT_LIGHT = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  surface: '#fcfcfb'
};

const CHART_TEXT_DARK = {
  primary: '#ffffff',
  secondary: '#c3c2b7',
  muted: '#898781',
  grid: '#2c2c2a',
  surface: '#1a1a19'
};

// Back-compat exports for any call site that hasn't switched to the hook yet.
export const MATERIAL_COLORS = MATERIAL_COLORS_LIGHT;
export const SEQUENTIAL_HUE = SEQUENTIAL_HUE_LIGHT;
export const CHART_TEXT = CHART_TEXT_LIGHT;

// Theme-aware chart colors - reads the current mode from Redux so every
// chart stays in sync with the app-wide light/dark toggle.
export const useChartTheme = () => {
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === 'dark';
  return {
    materialColors: isDark ? MATERIAL_COLORS_DARK : MATERIAL_COLORS_LIGHT,
    sequentialHue: isDark ? SEQUENTIAL_HUE_DARK : SEQUENTIAL_HUE_LIGHT,
    text: isDark ? CHART_TEXT_DARK : CHART_TEXT_LIGHT
  };
};
