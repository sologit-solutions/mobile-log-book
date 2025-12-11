import {useOwnTheme} from "@/context/themeContext";
import React, {useMemo, useState, useCallback} from "react";
import {StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import { useRouter } from "expo-router";
import {useFocusEffect} from "@react-navigation/native";
import {getLogs} from "@/database/db";

export interface Log {
    id: string;
    entry: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    updated_at: string;
}

export default function EventList() {
    const {theme} = useOwnTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const router = useRouter();

    const db = useSQLiteContext();


    /**
     * logs — holds all logbook records loaded from SQLite
     * - initially empty
     * - filled by getLogs() whenever the screen becomes active
     */
    const [logs, setLogs] = useState<Log[]>([]);

    /**
     * loading — controls when to show a loading spinner
     * - true while fetching data from SQLite
     * - false when logs have been loaded (or failed)
     */
    const [loading, setLoading] = useState(true);

    /**
     * runs the callback every time the screen comes into focus
     *
     * if the user adds a new activity and then navigates back here,
     * this hook ensures the event list refreshes automatically
     *
     * - fetchLogs() loads all log entries from SQLite
     */
    useFocusEffect(
        useCallback(() => {
            const fetchLogs = async () => {
                try {
                    setLoading(true);
                    const result = await getLogs(db);
                    setLogs(result as Log[]);
                } catch (error) {
                    console.error("Error fetching logs:", error);
                } finally {
                    setLoading(false);
                }
            };

            void fetchLogs();

        }, [db])
    );

    /**
     * Defines how each individual log entry is displayed inside FlatList
     *
     * @param item Log object containing timestamp, entry text, coordinates etc...
     */
    const renderItem = ({item}: { item: Log }) => (
        <TouchableOpacity
            onPress={() => {
                router.push(`/events/${item.id}`)
            }}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>
                        {new Date(item.timestamp).toLocaleString()}
                    </Text>
                </View>
                <Text style={styles.entryText}>{item.entry}</Text>
                <Text style={styles.coordText}>
                    Lat: {item.latitude.toFixed(8)}, Lon: {item.longitude.toFixed(8)}
                </Text>
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.textPrimary}/>
                </View>
            ) : (
                <FlatList
                    data={logs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>No events found yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        centerContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
        },
        listContent: {
            padding: 16,
            paddingBottom: 100, // Extra padding at bottom for scrolling
        },
        // Card Styles
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: {width: 0, height: 2},
            shadowRadius: 4,
            borderWidth: 0,
        },
        cardHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
        },
        entryText: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
        },
        dateText: {
            color: theme.colors.textSecondary, // || "#8e8e93",
            fontSize: 12,
        },
        coordText: {
            color: theme.colors.textSecondary, // || "#8e8e93",
            fontSize: 12,
            fontFamily: "monospace", // Makes numbers align better
        },
        emptyText: {
            color: theme.colors.textSecondary, // || "#8e8e93",
            fontSize: 16,
        },
    });