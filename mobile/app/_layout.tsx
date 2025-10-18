/**
 * Root Layout Component for Expo Application
 *
 * This is the main layout component that wraps the entire application
 * and provides global context providers for theme and application state.
 *
 * Architecture:
 * 1. AppStateProvider - Manages application state (user, mode, persistence)
 * 2. ThemeProvider - Manages application theme and styling
 * 3. RootLayoutContent - Main layout structure with safe area and status bar
 *
 * The layout structure ensures:
 * - Proper safe area handling for different device sizes
 * - Theme consistency across all screens
 * - Application state persistence
 * - Status bar styling that matches the theme
 */
import { ThemeProvider, useOwnTheme } from "@/context/themeContext";
import { AppStateProvider } from "@/state/appState";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

/**
 * Main layout content component that renders the application structure
 *
 * This component:
 * - Consumes theme context to apply consistent styling
 * - Handles safe area insets for different device sizes
 * - Configures status bar appearance
 * - Renders the Stack navigator for screen routing
 *
 * @component
 * @returns {JSX.Element} The main layout structure with theme-aware components
 *
 * @example
 * <RootLayoutContent />
 *
 * @see ThemeProvider
 * @see AppStateProvider
 */
function RootLayoutContent() {
  /**
   * Hook to access current theme values
   *
   * This hook retrieves the current theme object from ThemeProvider
   * which includes colors, spacing, typography, and other styling values
   *
   * @type {Object}
   * @property {Object} theme - Current theme configuration
   * @property {Object} theme.colors - Theme color palette
   * @property {Object} theme.spacing - Spacing scale
   * @property {Object} theme.typography - Typography styles
   */
  const { theme } = useOwnTheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <StatusBar
          //style="light"
          backgroundColor={theme.colors.statusBar}
          translucent
        />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/**
 * Main Root Layout Component
 *
 * This is the top-level component that wraps the entire application
 * with all necessary context providers and layout structure.
 *
 * The component structure:
 * 1. AppStateProvider - Provides global application state
 * 2. ThemeProvider - Provides theme context for styling
 * 3. RootLayoutContent - Main layout with safe area and navigation
 *
 * @component
 * @returns {JSX.Element} Complete application layout with providers
 *
 * @see AppStateProvider
 * @see ThemeProvider
 * @see RootLayoutContent
 */
export default function RootLayout() {
  return (
    <AppStateProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </AppStateProvider>
  );
}
