import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity, ScrollView, KeyboardAvoidingView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useLog, useUpdateLog, useDeleteLog } from "@/src/features/logbook/hooks";

export default function EventDetail() {
    const { id } = useLocalSearchParams();
    const logId = Array.isArray(id) ? id[0] : id;

    const { theme } = useOwnTheme();
    const router = useRouter();

    // Data Hooks
    const { data: log, isLoading } = useLog(logId!);
    const updateMutation = useUpdateLog();
    const deleteMutation = useDeleteLog();

    // Form State
    const [entryText, setEntryText] = useState("");
    const [dateStr, setDateStr] = useState("");
    const [timeStr, setTimeStr] = useState("");
    const [latStr, setLatStr] = useState("");
    const [lonStr, setLonStr] = useState("");

    // Sync state when data loads
    useEffect(() => {
        if (log) {
            setEntryText(log.entry);
            const d = new Date(log.timestamp);

            // Format to YYYY-MM-DD
            // simple trick: use ISO string and split it
            const isoDate = d.toISOString().split('T')[0];
            setDateStr(isoDate);

            // Format to HH:mm
            // extract the first 5 chars of the time part (e.g., "14:30")
            const isoTime = d.toTimeString().slice(0, 5);
            setTimeStr(isoTime);

            setLatStr(String(log.latitude));
            setLonStr(String(log.longitude));
        }
    }, [log]);

    const handleUpdate = () => {
        if (!logId) return;

        // 1. Validate & Parse Date/Time
        // Construct a standard ISO-like string: "2026-02-05T14:30:00"
        const combinedString = `${dateStr}T${timeStr}:00`;
        const newTimestamp = new Date(combinedString);

        if (isNaN(newTimestamp.getTime())) {
            Alert.alert("Invalid Date/Time", "Please use YYYY-MM-DD for date and HH:MM for time.");
            return;
        }

        // 2. Validate & Parse Location
        const newLat = parseFloat(latStr);
        const newLon = parseFloat(lonStr);

        if (isNaN(newLat) || isNaN(newLon)) {
            Alert.alert("Invalid Location", "Latitude and Longitude must be numbers.");
            return;
        }

        // 3. Send Update
        updateMutation.mutate(
            {
                id: logId,
                entry: entryText,
                timestamp: newTimestamp.toISOString(),
                lat: newLat,
                lon: newLon
            },
            {
                onSuccess: () => {
                    Alert.alert("Success", "Updated successfully");
                    router.back();
                },
                onError: () => {
                    Alert.alert("Error", "Failed to update event.");
                }
            }
        );
    };

    const handleDelete = () => {
        if (!logId) return;
        Alert.alert("Confirm", "Delete this event?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    deleteMutation.mutate(logId, {
                        onSuccess: () => router.back()
                    });
                }
            }
        ]);
    };

    if (isLoading || !log) {
        return (
            <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textPrimary }}>Loading...</Text>
            </Screen>
        );
    }

    return (
        <Screen style={{ flex: 1 }}>

            {/* --- TOP LEFT BACK BUTTON --- */}
            <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.headerBtn, styles.headerBackBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.textSecondary, borderWidth: 1 }]}
            >
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', fontSize: 14 }}>Back</Text>
            </TouchableOpacity>

            {/* --- TOP RIGHT DELETE BUTTON --- */}
            <TouchableOpacity
                onPress={handleDelete}
                style={[styles.headerBtn, styles.headerDeleteBtn, { backgroundColor: theme.colors.danger }]}
            >
                <Text style={styles.btnTextWhite}>Delete</Text>
            </TouchableOpacity>

            {/* Header Title (Fixed at top) */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Edit Event</Text>
            </View>

            {/* --- SCROLLABLE CONTENT --- */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Vessel Name (Read Only) */}
                    <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Vessel</Text>
                    <View style={[styles.readOnlyField, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surface }]}>
                        <Text style={{ color: theme.colors.textPrimary, fontSize: 16 }}>{log.vessel_name || "Unknown Vessel"}</Text>
                    </View>

                    {/* Date & Time Row */}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Input
                                label="Date"
                                value={dateStr}
                                onChangeText={setDateStr}
                                placeholder="YYYY-MM-DD" // Updated placeholder
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Time"
                                value={timeStr}
                                onChangeText={setTimeStr}
                                placeholder="HH:MM" // Updated placeholder
                            />
                        </View>
                    </View>

                    {/* Lat & Lon Row */}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Input
                                label="Latitude"
                                value={latStr}
                                onChangeText={setLatStr}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Longitude"
                                value={lonStr}
                                onChangeText={setLonStr}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Input
                        label="Activity Title"
                        value={entryText}
                        onChangeText={setEntryText}
                        style={{ height: 55 }}
                    />

                    {/* Spacer increased to ensure content isn't hidden behind the floating button */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* --- STICKY BOTTOM BUTTON --- */}
            <View style={styles.stickyFooter}>
                <Button
                    title="Save Changes"
                    onPress={handleUpdate}
                    loading={updateMutation.isPending}
                    style={styles.saveBtn}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    // SHARED BUTTON STYLES
    headerBtn: {
        position: 'absolute',
        top: 0,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        zIndex: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    headerBackBtn: {
        left: 15,
    },
    headerDeleteBtn: {
        right: 15,
    },
    btnTextWhite: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // SCROLL STYLES
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    bottomSpacer: {
        height: 160,
    },
    sectionLabel: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    readOnlyField: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // inputs inside row handle their own margins usually, but we ensure structure here
    },
    // FLOATING FOOTER STYLES
    stickyFooter: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        zIndex: 20,
    },
    saveBtn: {
        height: 55,
        width: '100%',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    }
});