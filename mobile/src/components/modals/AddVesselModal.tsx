import React, { useEffect } from "react";
import { Modal, KeyboardAvoidingView, ScrollView, Pressable, View, Text, StyleSheet, Platform, Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";

/**
 * Zod schema defining the strict data transfer requirements for a new vessel
 */
const addVesselSchema = z.object({
    name: z.string().min(1, "Vessel name is required"),
    type: z.string().optional(),
    registration: z.string().optional(),
});

export type AddVesselFormData = z.infer<typeof addVesselSchema>;

interface AddVesselModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: AddVesselFormData) => void;
    loading: boolean;
}

/**
 * Modal component for adding a new vessel to the logbook
 * Utilises uncontrolled inputs via react-hook-form to prevent render cycle bloat
 */
export const AddVesselModal: React.FC<AddVesselModalProps> = ({ visible, onClose, onSubmit, loading }) => {
    const { theme } = useOwnTheme();

    // Initialize the form controller
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<AddVesselFormData>({
        resolver: zodResolver(addVesselSchema),
        defaultValues: {
            name: "",
            type: "",
            registration: ""
        }
    });

    // Cleanup memory when modal closes
    useEffect(() => {
        if (!visible) {
            reset({ name: "", type: "", registration: "" });
        }
    }, [visible, reset]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={styles.modalScroll}>
                    <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>New Vessel</Text>

                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        placeholder="Vessel Name"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="none"
                                        error={errors.name?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="type"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        placeholder="Type (e.g. Sloop)"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="none"
                                        error={errors.type?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="registration"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        placeholder="Registration #"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="none"
                                        error={errors.registration?.message}
                                    />
                                )}
                            />

                            <View style={styles.modalActions}>
                                <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 10 }} />
                                {/* handleSubmit intercepts the click and executes Zod validation before allowing onSubmit to fire */}
                                <Button title="Save" onPress={handleSubmit(onSubmit)} loading={loading} style={{ flex: 1, marginLeft: 10 }} />
                            </View>
                        </View>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        paddingHorizontal: 20
    },
    modalScroll: {
        flexGrow: 1,
        justifyContent: "center"
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        width: "100%",
        borderWidth: 1
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    modalActions: {
        flexDirection: "row",
        marginTop: 20,
        width: "100%",
        justifyContent: "space-between"
    }
});