import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useOwnTheme } from "@/context/themeContext";
import React, { useMemo, useState, useEffect } from "react";
import {deleteLog, getLogById, updateLog} from "@/database/db";
import {useSQLiteContext} from "expo-sqlite";

interface Log {
    id: string;
    entry: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}

export default function EventDetail() {
    // Grab the ID from the URL
    const { id } = useLocalSearchParams();
    const { theme } = useOwnTheme();

    const styles = useMemo(() => createStyles(theme), [theme]);
    const router = useRouter();
    const db = useSQLiteContext()

    const [log, setLog] = useState<Log | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [inputText, setInputText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchLog = async () => {
            if (!id) return;
            try {
                const logId = Array.isArray(id) ? id : [id];
                const result = await getLogById(db, logId.toString());

                if (result) {
                    setLog(result as Log);
                    setInputText((result as Log).entry);
                } else {
                    Alert.alert("Error", "Log event not found");
                    router.back()
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Failed to load event");
            } finally {
                setLoading(false);
            }
        };

        void fetchLog();
    }, [id, db, router])

    const handleUpdate = async () => {

        if (!log) return;
        setIsSaving(true);

        try {
            await updateLog(db, log.id, inputText);
            Alert.alert("Success", "Log event successfully updated");
            router.back()
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to update event");
        } finally {
            setIsSaving(false);
        }
    }

    const handleDelete = async () => {
        if (!log) return;

        Alert.alert(
            "Delete event",
            "Are you sure to delete this log event",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteLog(db, log.id.toString());
                            router.back()
                        } catch (error) {
                            console.error(error);
                            Alert.alert("Error", "Failed to delete event");
                        }
                    }
                }
            ]
        )
    }

    if (loading) {
        return (
            <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" color={theme.colors.textPrimary}/>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1, backgroundColor: theme.colors.background}}
        >
            <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>

                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.contentContainer}>
                        <Text style={styles.headerTitle}>Edit Event</Text>

                        <View style={styles.card}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={styles.value}>
                                    {log ? new Date(log.timestamp).toLocaleDateString() : "-"}
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Time</Text>
                                <Text style={styles.value}>
                                    {log ? new Date(log.timestamp).toLocaleTimeString() : "-"}
                                </Text>
                            </View>

                            {/*TODO: Show if N/S and if E/S*/}
                            <View style={[styles.coordSection, { borderBottomWidth: 0 }]}>
                                <Text style={[styles.label, { marginBottom: 8 }]}>Coordinates</Text>

                                <View style={styles.coordRow}>
                                    <Text style={styles.coordLabel}>Lat:</Text>
                                    <Text style={styles.valueCoord}>{log?.latitude.toFixed(8)}</Text>
                                </View>

                                <View style={styles.coordRow}>
                                    <Text style={styles.coordLabel}>Lon:</Text>
                                    <Text style={styles.valueCoord}>{log?.longitude.toFixed(8)}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Activity Name</Text>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Activity description"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleUpdate}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color={theme.colors.textPrimary} />
                                ) : (
                                    <Text style={styles.actionButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={handleDelete}
                                disabled={isSaving}
                            >
                                <Text style={[styles.actionButtonText, styles.deleteText]}>Delete Event</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        contentContainer: {
            padding: 20,
            paddingTop: 70,
        },
        backButton: {
            position: "absolute",
            top: 20,
            left: 20,
            backgroundColor: theme.colors.surface,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            zIndex: 10,
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
        },
        buttonText: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: "bold",
            color: theme.colors.textPrimary,
            marginBottom: 20,
            marginTop: 10,
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            padding: 16,
            marginBottom: 24,
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.background,
        },
        coordSection: {
            paddingVertical: 12,
        },
        coordRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 4,
            paddingLeft: 10,
        },
        coordLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: "500",
        },
        label: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: "600",
        },
        value: {
            fontSize: 16,
            color: theme.colors.textPrimary,
            fontWeight: "500",
        },
        valueCoord: {
            fontSize: 15,
            color: theme.colors.textPrimary,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        },
        inputLabel: {
            fontSize: 16,
            fontWeight: "600",
            color: theme.colors.textPrimary,
            marginBottom: 10,
            marginLeft: 4,
        },
        input: {
            width: "100%",
            height: 50,
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            paddingHorizontal: 15,
            fontSize: 16,
            color: theme.colors.textPrimary,
            marginBottom: 30,
            borderWidth: 1,
            borderColor: theme.colors.surface,
        },
        buttonContainer: {
            gap: 15,
        },
        actionButton: {
            backgroundColor: theme.colors.surface,
            paddingVertical: 15,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
        },
        actionButtonText: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
        },
        deleteButton: {
            marginTop: 10,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: "red",
        },
        deleteText: {
            color: "red",
        }
    });