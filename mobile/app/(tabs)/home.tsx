import React from "react";
import { StyleSheet, Text, View, Alert, ViewStyle } from "react-native";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { getCurrentLocation } from "@/src/utils/location";
import { useAddLog } from "@/src/features/logbook/hooks";
import { useVesselStore } from "@/src/store/vesselStore";

export default function AddActivity() {
    const { theme } = useOwnTheme();
    const { currentVessel } = useVesselStore();

    // 1. Use the mutation hook
    const addLogMutation = useAddLog();

    const handleLogAction = async (label: string) => {
        try {
            // 2. We still handle location manually here, but the DB save is via hook
            const location = await getCurrentLocation();

            addLogMutation.mutate(
                {
                    entry: label,
                    lat: location.coords.latitude,
                    lon: location.coords.longitude,
                    vesselId: currentVessel?.id,
                },
                {
                    onSuccess: () => {
                        Alert.alert("Success", `Saved "${label}" to logbook.`);
                    },
                    onError: () => {
                        Alert.alert("Error", "Could not save entry.");
                    }
                }
            );
        } catch (error) {
            Alert.alert("Error", "Could not acquire location.");
        }
    };

    return (
        <Screen style={styles.container}>
            {addLogMutation.isPending ? (
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme.colors.textPrimary }}>Saving...</Text>
                </View>
            ) : (
                <>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Add an activity
                    </Text>

                    <View style={styles.grid}>
                        <View style={styles.row}>
                            <ActionButton label="Hoist sails" onPress={() => handleLogAction("Hoist sails")} />
                            <ActionButton label="Lower sails" onPress={() => handleLogAction("Lower sails")} />
                        </View>
                        <View style={styles.row}>
                            <ActionButton label="Hoist anchor" onPress={() => handleLogAction("Hoist anchor")} />
                            <ActionButton label="Lower anchor" onPress={() => handleLogAction("Lower anchor")} />
                        </View>
                        <View style={styles.row}>
                            <ActionButton label="Engine on" onPress={() => handleLogAction("Engine on")} />
                            <ActionButton label="Engine off" onPress={() => handleLogAction("Engine off")} />
                        </View>
                    </View>
                </>
            )}
        </Screen>
    );
}

// Small local wrapper to keep the grid clean
const ActionButton = ({ label, onPress }: { label: string, onPress: () => void }) => (
    <Button
        title={label}
        onPress={onPress}
        style={styles.button}
        textStyle={styles.buttonText}
    />
);

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 30,
    },
    grid: {
        width: "100%",
        gap: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        width: "48%",
        height: 100, // Taller buttons for easy tapping
        borderRadius: 15,
    },
    buttonText: {
        textAlign: 'center',
    }
});