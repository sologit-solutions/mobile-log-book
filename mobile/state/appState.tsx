/**
 * Application State Management System
 *
 * This module implements a React Context-based state management solution
 * for tracking application mode (online/offline), rudimental user
 * authentication, and persistent storage of user preferences.
 *
 * Key Features:
 * - Global state access across all components
 * - Automatic persistence using AsyncStorage
 * - User session management with logout functionality
 * - Network mode tracking (online/offline)
 *
 * Architecture:
 * 1. AppStateContext - The React Context that holds all state
 * 2. AppStateProvider - Component that wraps the app and provides state
 * 3. useAppState - Custom hook to consume the context
 *
 * Usage:
 * - Wrap your app with AppStateProvider in _layout.tsx
 * - Use useAppState() hook in any component to access state
 *
 * State Persistence:
 * - User data stored in AsyncStorage under "user" key
 * - App mode stored in AsyncStorage under "appMode" key
 * - Data persists between app restarts
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Application mode type - represents whether app is used online or offline
 *
 * @typedef {("online" | "offline")} AppMode
 */
type AppMode = "online" | "offline";

type AppStateContextType = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  user: string | null;
  setUser: (user: string | null) => void;
  logout: () => Promise<void>;
};

/**
 * Creates a React Context with the type of AppStateContextType
 */
const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

/**
 * Application State Provider Component
 *
 * This component wraps the entire application and provides global state
 * to all child components through React Context.
 *
 * The provider:
 * - Manages application mode (online/offline)
 * - Manages user authentication state
 * - Handles persistence of state to AsyncStorage
 * - Provides logout functionality
 *
 * @component
 * @param {React.ReactNode} children Child components that will have access to state
 * @returns {JSX.Element} Provider component wrapping children
 *
 * @example
 * <AppStateProvider>
 *   <YourApp />
 * </AppStateProvider>
 */
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<AppMode>("online");
  const [user, setUser] = useState<string | null>(null);

  /**
   * Initialise state from persistent storage on application start
   */
  useEffect(() => {
    (async () => {
      const savedMode = await AsyncStorage.getItem("appMode");
      const savedUser = await AsyncStorage.getItem("user");
      if (savedMode === "offline") setMode("offline");
      if (savedUser) setUser(savedUser);
    })();
  }, []);

  /**
   * Saves mode changes to device storage whenever mode changes
   */
  useEffect(() => {
    AsyncStorage.setItem("appMode", mode);
  }, [mode]);

  /**
   * Saves user data when user changes
   * Removes user data when user logs out
   */
  useEffect(() => {
    if (user) AsyncStorage.setItem("user", user);
    else AsyncStorage.removeItem("user");
  }, [user]);

  /**
   * Resets all user-related state
   * Clears persistent storage
   * Sets app back to offline mode
   */
  const logout = async () => {
    setUser(null);
    setMode("offline");
    await AsyncStorage.multiRemove(["appMode", "user"]);
    console.log("User logged out, mode reset to offline");
  };

  return (
    <AppStateContext.Provider value={{ mode, setMode, user, setUser, logout }}>
      {children}
    </AppStateContext.Provider>
  );
};

/**
 *
 * @returns {AppStateContextType} The current application state and functions
 * @throws {Error} If hook is used outside AppStateProvider
 * @example const { mode, user, logout } = useAppState();
 */
export const useAppState = (): AppStateContextType => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
