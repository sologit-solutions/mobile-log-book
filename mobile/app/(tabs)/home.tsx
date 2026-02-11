import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from "react-native";
import { Screen } from "@/src/components/Screen";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import { useVesselStore } from "@/src/store/vesselStore";
import { useButtonStore } from "@/src/store/buttonStore"; // <--- Import Store
import { useRouter } from "expo-router";
import { useAddLog } from "@/src/features/logbook/hooks";
import * as Location from 'expo-location';

export default function Home() {
    const { theme } = useOwnTheme();
    const router = useRouter();
    const { user } = useAuthStore();
    const { currentVessel } = useVesselStore();
    const { buttons } = useButtonStore(); // <--- Get dynamic buttons
    const addLogMutation = useAddLog();

    const [locationLoading, setLocationLoading] = useState(false);

    const handleAction = async (actionLabel: string) => {
        if (!currentVessel) {
            Alert.alert("No Vessel", "Please select a vessel in your profile first.");
            return;
        }

        setLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission denied", "Location is needed to log entries.");
                setLocationLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});

            addLogMutation.mutate({
                vesselId: currentVessel.id,
                //timestamp: new Date().toISOString(),
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
                entry: actionLabel // Using the dynamic label as the entry text
            }, {
                onSuccess: () => {
                    Alert.alert("Logged", `${actionLabel} recorded.`);
                },
                onError: (err) => {
                    Alert.alert("Error", "Failed to save log.");
                }
            });

        } catch (error) {
            Alert.alert("Error", "Could not fetch location.");
        } finally {
            setLocationLoading(false);
        }
    };

    const renderButton = ({ item }: { item: { id: string, label: string } }) => (
        <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleAction(item.label)}
            disabled={locationLoading || addLogMutation.isPending}
        >
            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.vesselTitle, { color: theme.colors.textPrimary }]}>
                    {currentVessel ? currentVessel.name : "No Vessel Selected"}
                </Text>
                {!currentVessel && (
                    <Text style={{ color: theme.colors.textSecondary, marginTop: 5 }}>
                        Go to Profile to select a vessel
                    </Text>
                )}
            </View>

            <View style={styles.gridContainer}>
                <FlatList
                    data={buttons}
                    keyExtractor={(item) => item.id}
                    renderItem={renderButton}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                            No buttons configured. Go to Profile to add some.
                        </Text>
                    }
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        //marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    vesselTitle: {
        fontSize: 32, // Bigger font
        fontWeight: "bold",
        textAlign: "center",
    },
    welcome: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 5,
    },
    gridContainer: {
        flex: 1,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 15, // Space between rows
    },
    actionBtn: {
        width: '48%',
        aspectRatio: 2, // Keeps buttons rectangular/square-ish
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    actionText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        padding: 5,
    },
});