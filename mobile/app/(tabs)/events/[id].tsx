import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Platform, ScrollView, KeyboardAvoidingView, Keyboard } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { useOwnTheme } from "@/src/context/ThemeContext";
import { useLogItem, useUpdateLogItem, useDeleteLogItem } from "@/src/features/logbook/hooks";
import { useLogbookStore } from "@/src/store/logbookStore";

/**
 * Zod schema for validating event edits before they hit the mutation layer
 * z.coerce.number to automatically transform the raw string inputs from the UI into numbers
 * If input is empty or invalid, it catches the NaN and passes the custom message to the UI
 */
const eventSchema = z.object({
    title: z.string().min(1, "Activity title is required."),
    body: z.string().nullable().optional(),
    lat: z.coerce.number({ message: "Must be a valid number." }),
    lon: z.coerce.number({ message: "Must be a valid number." }),
});

// Extract the TS type directly from the schema definition
type EventDTO = z.infer<typeof eventSchema>;

export default function EventDetail() {
    const { id } = useLocalSearchParams();
    const logId = Array.isArray(id) ? id[0] : id;

    const { theme } = useOwnTheme();
    const router = useRouter();

    // Data Hooks
    const { currentLogbook } = useLogbookStore();
    const { data: log, isLoading } = useLogItem(logId!);
    const updateMutation = useUpdateLogItem();
    const deleteMutation = useDeleteLogItem();

    /**
     * Initialize the form controller with the Zod resolver
     * Pass 3 generic type arguments to explicitly tell TS how to handle the data transformation
     * 1st Generic: The relaxed input type where lat and lon are treated as unknown due to the coerce function
     * 2nd Generic: Form context which we do not use here
     * 3rd Generic: The final strict EventDTO output type that our onSubmit function expects
     */
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<z.input<typeof eventSchema>, any, EventDTO>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            body: "",
            lat: 0,
            lon: 0
        }
    });

    // Keyboard + scroll State
    const scrollViewRef = useRef<ScrollView>(null);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isBodyFocused, setIsBodyFocused] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (isKeyboardVisible && isBodyFocused) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [isKeyboardVisible, isBodyFocused]);

    // Hydrate the form from the db query
    useEffect(() => {
        if (log) {
            reset({
                title: log.title,
                body: log.body || "",
                lat: log.latitude,
                lon: log.longitude
            });
        }
    }, [log, reset]);

    // This function fires if Zod validation passes
    const onSubmit = (data: EventDTO) => {
        if (!logId || !currentLogbook?.id) {
            Alert.alert("Error", "Missing log or vessel info");
            return;
        }

        updateMutation.mutate(
            {
                id: logId,
                title: data.title,
                body: data.body?.trim() === "" ? null : data.body,
                lat: data.lat,
                lon: data.lon,
                logbookId: currentLogbook.id
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
        if (!logId || !currentLogbook?.id) return;
        Alert.alert("Confirm", "Delete this event?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    deleteMutation.mutate({ id: logId, logbookId: currentLogbook.id }, {
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

            <Button title="Back" variant="outline" shape="pill" onPress={() => router.back()} style={styles.headerBackBtn} />
            <Button title="Delete" variant="danger" shape="pill" onPress={handleDelete} style={styles.headerDeleteBtn} />

            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Edit Event</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                >
                    <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Vessel</Text>
                    <View style={[styles.readOnlyField, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surface }]}>
                        <Text style={{ color: theme.colors.textPrimary, fontSize: 16 }}>{currentLogbook?.name || "Unknown Logbook"}</Text>
                    </View>

                    <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Event Time</Text>
                    <View style={[styles.readOnlyField, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surface }]}>
                        <Text style={{ color: theme.colors.textPrimary, fontSize: 16 }}>{new Date(log.created_at).toLocaleString()}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Controller
                                control={control}
                                name="lat"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Latitude"
                                        value={String(value)}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                        error={errors.lat?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="lon"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Longitude"
                                        value={String(value)}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                        error={errors.lon?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="title"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Activity Title"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.title?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="body"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Detailed Log (Optional)"
                                value={value || ""}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                multiline
                                style={{ height: 120, textAlignVertical: 'top' }}
                                onFocus={() => setIsBodyFocused(true)}
                                error={errors.body?.message}
                            />
                        )}
                    />

                    <View style={{ height: isKeyboardVisible ? 20 : 160 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {!isKeyboardVisible && (
                <View style={styles.stickyFooter}>
                    {/* Trigger the wrapped submission handler */}
                    <Button title="Save Changes" onPress={handleSubmit(onSubmit)} loading={updateMutation.isPending} />
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    headerBackBtn: {
        position: 'absolute',
        top: 0,
        left: 15,
        zIndex: 10
    },
    headerDeleteBtn: {
        position: 'absolute',
        top: 0,
        right: 15,
        zIndex: 10
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
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
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        zIndex: 20,
    }
});