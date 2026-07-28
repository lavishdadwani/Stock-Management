import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "../constants/colors";

const STORAGE_KEY = "themeMode"; // 'light' | 'dark' | 'system'

const ThemeContext = createContext({
  colors: lightColors,
  scheme: "light",
  mode: "system",
  setMode: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setModeState(stored);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setMode = async (next) => {
    setModeState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failure - theme just won't survive an app restart
    }
  };

  const scheme = mode === "system" ? systemScheme || "light" : mode;

  const value = useMemo(
    () => ({
      colors: scheme === "dark" ? darkColors : lightColors,
      scheme,
      mode,
      setMode,
    }),
    [scheme, mode]
  );

  // Avoid a light->dark flash while the persisted preference loads
  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
