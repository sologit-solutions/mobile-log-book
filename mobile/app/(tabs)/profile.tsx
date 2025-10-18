import { useOwnTheme } from "@/context/themeContext";
import { useAppState } from "@/state/appState";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const { theme } = useOwnTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user, mode, logout } = useAppState();

  const router = useRouter();

  const handleLogout = () => {
    logout();
    //Alert.alert("Logged out", "You have been logged out successfully");
    router.replace("../");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>
          {mode === "online" ? "Logout" : "Exit to login screen"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.text}>This is the profile page</Text>
      <Text style={styles.text}>
        User is: {mode === "online" ? user : "Offline user"}
      </Text>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    logoutButton: {
      position: "absolute",
      top: 20,
      right: 20,
      backgroundColor: theme.colors.surface,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      zIndex: 10,
    },
    logoutText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
  });
