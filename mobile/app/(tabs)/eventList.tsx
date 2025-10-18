import { useOwnTheme } from "@/context/themeContext";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EventList() {
  const { theme } = useOwnTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Here you can see a list of all the events</Text>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      //justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
  });
