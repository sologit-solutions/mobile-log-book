import React, { createContext, useContext, useState, ReactNode } from "react";
import { DARK_THEME, LIGHT_THEME } from "@/src/constants/Colors";

type ThemeColors = typeof DARK_THEME;

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Custom hook to access theme context
 */
export const useOwnTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useOwnTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme: Theme = {
    colors: isDark ? DARK_THEME : LIGHT_THEME,
    isDark,
  };

  return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
  );
};