import { useOwnTheme } from "@/context/themeContext";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AddActivity() {
  const { theme } = useOwnTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Individual button handlers — add logic later
  const handleAdd1 = () => console.log("Add 1 pressed");
  const handleAdd2 = () => console.log("Add 2 pressed");
  const handleAdd3 = () => console.log("Add 3 pressed");
  const handleAdd4 = () => console.log("Add 4 pressed");
  const handleAdd5 = () => console.log("Add 5 pressed");
  const handleAdd6 = () => console.log("Add 6 pressed");

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add an activity here</Text>

      {/* 2x3 Grid of buttons */}
      <View style={styles.gridContainer}>
        <View style={styles.row}>
          <ActivityButton label="Add 1" onPress={handleAdd1} theme={theme} />
          <ActivityButton label="Add 2" onPress={handleAdd2} theme={theme} />
        </View>

        <View style={styles.row}>
          <ActivityButton label="Add 3" onPress={handleAdd3} theme={theme} />
          <ActivityButton label="Add 4" onPress={handleAdd4} theme={theme} />
        </View>

        <View style={styles.row}>
          <ActivityButton label="Add 5" onPress={handleAdd5} theme={theme} />
          <ActivityButton label="Add 6" onPress={handleAdd6} theme={theme} />
        </View>
      </View>
    </View>
  );
}

const ActivityButton = ({ label, onPress, theme }: any) => {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity style={styles.addItemButton} onPress={onPress}>
      <Text style={styles.addItemText}>{label}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 20,
    },
    gridContainer: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
      marginBottom: 20,
    },
    addItemButton: {
      backgroundColor: theme.colors.surface,
      width: "45%",
      paddingVertical: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    addItemText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
