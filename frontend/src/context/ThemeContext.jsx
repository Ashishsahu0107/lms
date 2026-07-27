import { ThemeProvider as ReduxThemeProvider } from "../providers/ThemeProvider";
import { useTheme as useReduxTheme } from "../hooks/useTheme";

export function ThemeProvider({ children }) {
  return <ReduxThemeProvider>{children}</ReduxThemeProvider>;
}

export function useTheme() {
  return useReduxTheme();
}

export default ThemeProvider;
