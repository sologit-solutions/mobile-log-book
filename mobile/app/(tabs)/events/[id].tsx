import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity, ScrollView, KeyboardAvoidingView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Card } from "@/src/components/Card";
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

    const [entryText, setEntryText] = useState("");

    // Sync state when data loads
    useEffect(() => {
        if (log) setEntryText(log.entry);
    }, [log]);

    const handleUpdate = () => {
        if (!logId) return;
        updateMutation.mutate(
            { id: logId, entry: entryText },
            {
                onSuccess: () => {
                    Alert.alert("Success", "Updated successfully");
                    router.back();
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

    const dateObj = new Date(log.timestamp);

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
                    <Card style={styles.infoCard}>
                        <InfoRow label="Vessel" value={log.vessel_name || "-"} />
                        <InfoRow label="Date" value={dateObj.toLocaleDateString()} />
                        <InfoRow label="Time" value={dateObj.toLocaleTimeString()} />
                        <InfoRow label="Latitude" value={log.latitude.toFixed(6)} font="mono" />
                        <InfoRow label="Longitude" value={log.longitude.toFixed(6)} font="mono" />
                    </Card>

                    <Input
                        label="Activity Title"
                        value={entryText}
                        onChangeText={setEntryText}
                        style={{ height: 55 }}
                    />

                    {/* Spacer to ensure content isn't hidden behind the floating button */}
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

const InfoRow = ({ label, value, font }: { label: string, value: string, font?: 'mono' }) => {
    const { theme } = useOwnTheme();
    return (
        <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
            <Text style={[
                styles.value,
                { color: theme.colors.textPrimary },
                font === 'mono' && styles.mono
            ]}>
                {value}
            </Text>
        </View>
    );
};

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
        marginBottom: 10, // Reduced bottom margin
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
        height: 100, // Provides space for the floating button
    },
    infoCard: {
        marginBottom: 25,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 15,
        fontWeight: '500',
    },
    mono: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    // FLOATING FOOTER STYLES
    stickyFooter: {
        position: 'absolute',
        bottom: 80, // Distance from bottom of screen
        left: 20,
        right: 20,
        zIndex: 20, // Ensures it overlays content
    },
    saveBtn: {
        height: 55,
        width: '100%',
        justifyContent: 'center',
        elevation: 5, // Shadow for Android
        shadowColor: "#000", // Shadow for iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    }
});