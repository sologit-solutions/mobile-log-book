import React from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Card } from "@/src/components/Card";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useLogs } from "@/src/features/logbook/hooks";
import { useVesselStore } from "@/src/store/vesselStore";
import { DBLog } from "@/src/types/db";
import { Button } from "@/src/components/Button";

export default function EventList() {
    const { theme } = useOwnTheme();
    const router = useRouter();
	const { currentVessel } = useVesselStore();

    // React Query handles loading/error/data automatically
    const { data: logs, isLoading } = useLogs(currentVessel?.id);

	// Show message if no vessel is selected
	if (!currentVessel) {
        return (
            <Screen style={styles.centerContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
                    No Vessel Selected
                </Text>
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
                    Please select a vessel to view its logbook.
                </Text>
                <Button
                    title="Go to Profile"
                    onPress={() => router.navigate("/(tabs)/profile")}
                />
            </Screen>
        );
    }

    const renderItem = ({ item }: { item: DBLog }) => (
        <Card
            onPress={() => router.push(`/events/${item.id}`)}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
                {item.vessel_name && (
                    <Text style={[styles.vesselNameText, { color: theme.colors.primary }]}>
                        {item.vessel_name}
                    </Text>
                )}
            </View>
            <Text style={[styles.entryText, { color: theme.colors.textPrimary }]}>
                {item.entry}
            </Text>
			<Text style={[styles.coordText, { color: theme.colors.textSecondary }]}>
                {(item.latitude === 0 && item.longitude === 0)
                    ? "No Location Data"
                    : `Lat: ${item.latitude.toFixed(8)}, Lon: ${item.longitude.toFixed(8)}`
                }
            </Text>
        </Card>
    );

    return (
        <Screen>
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.textPrimary} />
                </View>
            ) : (
                <FlatList
                    data={logs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={{ color: theme.colors.textSecondary }}>
								No events recorded for {currentVessel.name}.
							</Text>
                        </View>
                    }
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        //marginTop: 50,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    entryText: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
	emptyText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    dateText: {
        fontSize: 12,
    },
    coordText: {
        fontSize: 12,
        fontFamily: "monospace",
    },
    vesselNameText: {
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
});
