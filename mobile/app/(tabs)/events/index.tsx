import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert, Platform, RefreshControl } from "react-native";
import { useRouter } from "expo-router";

import { File, Paths, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Screen } from "@/src/components/Screen";
import { Card } from "@/src/components/Card";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useLogItems, useSyncLogItems } from "@/src/features/logbook/hooks";
import { useLogbookStore } from "@/src/store/logbookStore";
import { DBLogItem } from "@/src/types/db";
import { Button } from "@/src/components/Button";

export default function EventList() {
    const { theme } = useOwnTheme();
    const router = useRouter();
	const { currentLogbook } = useLogbookStore();

    // React Query handles loading/error/data automatically
    const { data: logs, isLoading } = useLogItems(currentLogbook?.id);

    // initialise sync engine
    const syncMutation = useSyncLogItems();

    // state to prevent infinite autofetching
    const [hasInitialFetchRun, setHasInitialFetchRun] = useState(false);

    // Automatic fetch
    useEffect(() => {
        if (currentLogbook?.id && !hasInitialFetchRun) {
            syncMutation.mutate(currentLogbook.id);
            setHasInitialFetchRun(true);
        }
    }, [currentLogbook?.id, hasInitialFetchRun, syncMutation]);

const handleExport = async () => {
        if (!logs || logs.length === 0) {
            Alert.alert("No Data", "There are no events to export.");
            return;
        }

        try {
            let csvContent = "Date,Time,Event,Details,Latitude,Longitude\n";

            logs.forEach((log) => {
                const dateObj = new Date(log.created_at);

                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');

                const dateStr = `${year}-${month}-${day}`;

                const timeStr = dateObj.toTimeString().slice(0, 5);

				const cleanTitle = log.title.replace(/,/g, " ");
                const cleanBody = log.body ? log.body.replace(/,/g, " ") : "";

                csvContent += `${dateStr},${timeStr},${cleanTitle},${cleanBody},${log.latitude},${log.longitude}\n`;
            });

            const safeName = currentLogbook?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "logs";

            if (Platform.OS === 'android') {
                const directory = await Directory.pickDirectoryAsync();

                if (directory) {
                    const file = directory.createFile(`${safeName}_export`, 'text/csv');
                    file.write(csvContent);

                    Alert.alert("Success", "Logbook successfully saved to your device.");
                }

            } else {
                const file = new File(Paths.document, `${safeName}_export.csv`);

                if (!file.exists) {
                    file.create();
                }
                file.write(csvContent);

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(file.uri, {
                        mimeType: 'text/csv',
                        dialogTitle: `Export Logs for ${currentLogbook?.name}`
                    });
                } else {
                    Alert.alert("Error", "File sharing is disabled or unavailable on this device.");
                }
            }

        } catch (error: any) {
            console.error("Export pipeline failed:", error);
            Alert.alert("Export Error", "A system error occurred while generating or saving the CSV.");
        }
    };

	// Show message if no vessel is selected
    if (!currentLogbook) {
        return (
            <Screen style={{ flex: 1, padding: 20 }}>
                <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 30 }}>
                    <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
                        No Vessel Selected
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                        Please select a vessel to view its logbook.
                    </Text>
                </View>

                <Button
                    title="Go to Profile"
                    onPress={() => router.navigate("/(tabs)/profile")}
                />
            </Screen>
        );
    }

const renderItem = ({ item }: { item: DBLogItem }) => (
        <Card
            onPress={() => router.push(`/events/${item.id}`)}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                    {new Date(item.created_at).toLocaleString()}
                </Text>
            </View>

            <Text style={[styles.entryText, { color: theme.colors.textPrimary }]}>
                {item.title}
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
        <Screen style={{ flex: 1 }}>
            <View style={styles.topBar}>
                <Text
                    style={[styles.pageTitle, { color: theme.colors.textPrimary }]}
                    numberOfLines={1}
                >
                    ⛵ {currentLogbook.name}
                </Text>

                <Button
                    title="Export CSV"
                    variant="outline"
                    shape="pill"
                    onPress={handleExport}
                />
            </View>

            <View style={{ flex: 1 }}>
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
                                    No events recorded for {currentLogbook.name}.
                                </Text>
                            </View>
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={syncMutation.isPending}
                                onRefresh={() => {
                                    if (currentLogbook?.id) {
                                        syncMutation.mutate(currentLogbook.id);
                                    }
                                }}
                                tintColor={theme.colors.primary}
                            />
                        }
                    />
                )}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 15,
        paddingTop: 10,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
});
