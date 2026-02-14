import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native";
import { Screen } from "@/src/components/Screen";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useVesselStore } from "@/src/store/vesselStore";
import { useButtonStore } from "@/src/store/buttonStore"; // <--- Import Store
import { useAddLog } from "@/src/features/logbook/hooks";
import { getCurrentLocation } from "@/src/utils/location";

export default function Home() {
    const { theme } = useOwnTheme();
    const { currentVessel } = useVesselStore();
    const { buttons } = useButtonStore(); // <--- Get dynamic buttons
    const addLogMutation = useAddLog();

    // const [locationLoading, setLocationLoading] = useState(false);

	const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);

    const handleAction = async (actionLabel: string, buttonId: string) => {
        if (!currentVessel) {
            Alert.alert("No Vessel", "Please select a vessel in your profile first.");
            return;
        }

        setLoadingButtonId(buttonId);

		let lat = 0
		let lon = 0

        try {

			// Set timeout for 5 seconds
			const timeoutPromise = new Promise<{ coords: { latitude: number; longitude: number } }>((_, reject) =>
                setTimeout(() => reject(new Error("Location timeout")), 10000)
            );

            const loc = await Promise.race([
				getCurrentLocation(),
				timeoutPromise
			])

			lat = loc.coords.latitude
			lon = loc.coords.longitude

        } catch (error: any) {
            // Now we catch the specific error from our utility
			console.log("Location fetch failed or timed out. Saving with (0,0). Error:", error.message);
            Alert.alert("Location Error", error.message || "Could not fetch location.");
        }

		addLogMutation.mutate({
			vesselId: currentVessel.id,
			lat: lat,
			lon: lon,
			entry: actionLabel
		}, {
			onSuccess: () => {
				Alert.alert("Success", "Event saved succesfully")
			},
			onError: (error) => {
				console.error(error);
				Alert.alert("Error", "Failed to save log")
			},
			onSettled: () => {
				setLoadingButtonId(null)
			}
		})
    };

    const renderButton = ({ item }: { item: { id: string, label: string } }) => {
		const isThisLoading = loadingButtonId === item.id;
		const isAnyLoading = loadingButtonId !== null;
		const isDisabled = isAnyLoading && !isThisLoading;

		return (
		<TouchableOpacity
            style={[
				styles.actionBtn,
				{ backgroundColor: theme.colors.surface },
				isThisLoading && { opacity: 0.8 },
				isDisabled && { opacity: 0.3 }
			]}
            onPress={() => handleAction(item.label, item.id)}
            disabled={loadingButtonId !== null}
        >
			{isThisLoading ? (
				<ActivityIndicator size="large" color={theme.colors.textPrimary} />
			) : (
				<Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>
                        {item.label}
				</Text>
			)}
        </TouchableOpacity>
		)
	};

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
