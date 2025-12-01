import { useOwnTheme } from "@/context/themeContext";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {getCurrentLocation} from "@/utils/location";

export default function AddActivity() {
  const { theme } = useOwnTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLocation = async (buttonLabel: string) => {
      console.log(`Fetching location for ${buttonLabel}...`);

      try {
          const location = await getCurrentLocation();

          console.log(`DATA RECEIVED [${buttonLabel}]:`);
          console.log("------------------------------------------------");
          console.log("Latitude: ", location.coords.latitude);
          console.log("Longitude:", location.coords.longitude);
          console.log("Normalized timestamp:", new Date(location.timestamp).toLocaleString());
          console.log("Timestamp:", new Date(location.timestamp));
          console.log("------------------------------------------------");
      } catch (error) {
          console.error(error);
      }
  }

  // Individual button handlers
    const handleAdd1 = () => handleLocation("Hoist sails");
    const handleAdd2 = () => handleLocation("Lower sails");
    const handleAdd3 = () => handleLocation("Hoist anchor");
    const handleAdd4 = () => handleLocation("Lower anchor");
    const handleAdd5 = () => handleLocation("Engine on");
    const handleAdd6 = () => handleLocation("Engine off");

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add an activity here</Text>

      {/* 2x3 Grid of buttons */}
      <View style={styles.gridContainer}>
        <View style={styles.row}>
          <ActivityButton label="Hoist sails" onPress={handleAdd1} theme={theme} />
          <ActivityButton label="Lower sails" onPress={handleAdd2} theme={theme} />
        </View>

        <View style={styles.row}>
          <ActivityButton label="Hoist anchor" onPress={handleAdd3} theme={theme} />
          <ActivityButton label="Lower anchor" onPress={handleAdd4} theme={theme} />
        </View>

        <View style={styles.row}>
          <ActivityButton label="Engine on" onPress={handleAdd5} theme={theme} />
          <ActivityButton label="Engine off" onPress={handleAdd6} theme={theme} />
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
