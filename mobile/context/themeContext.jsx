/**
 * Theme Context Provider
 *
 * This module implements a React Context-based theme management system
 * for switching between dark and light themes throughout the application.
 *
 * Features:
 * - Theme state management (dark/light mode)
 * - Theme switching functionality
 * - Consistent theme access across components
 * - Type-safe theme context
 */

import { DARK_THEME, LIGHT_THEME } from "@/assets/styles/defaultColors";
import { createContext, useContext, useState } from "react";

/**
 * Theme Context
 *
 * React Context for providing theme information and functions
 * to all components in the application.
 *
 * @see ThemeProvider
 * @see useOwnTheme
 */
const ThemeContext = createContext();

/**
 * Custom hook to access theme context
 *
 * This hook should only be used within ThemeProvider.
 * If used outside the provider, it will throw an error.
 *
 * @example
 * const { theme, toggleTheme } = useOwnTheme();
 *
 * @see ThemeProvider
 */
export const useOwnTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme mus be within a ThemeProvider");
  }

  return context;
};

/**
 * Theme Provider Component
 *
 * This component wraps the entire application and provides theme context
 * to all child components through React Context.
 *
 * The provider:
 * - Manages theme state (dark/light mode)
 * - Provides theme switching functionality
 * - Exposes current theme and toggle function
 * - Handles theme persistence (currently in memory only)
 *
 * @component
 * @param children - Child components that will have access to theme
 * @returns Provider component wrapping children
 *
 * @example
 * <ThemeProvider>
 *   <YourApp />
 * </ThemeProvider>
 *
 * @see useOwnTheme
 * @see DARK_THEME
 * @see LIGHT_THEME
 */
export const ThemeProvider = ({ children }) => {
  /**
   * State for tracking current theme mode
   *
   * @type {boolean}
   * @default true (dark mode)
   */
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    colors: isDark ? DARK_THEME : LIGHT_THEME,
    isDark,
  };

  /**
   * Provider component that makes theme available to child components
   *
   * @returns {JSX.Element} Provider component with theme context
   */
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
