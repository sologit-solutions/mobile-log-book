import React, { useState, useEffect } from "react";
import { Modal, KeyboardAvoidingView, ScrollView, Pressable, View, Text, StyleSheet, Platform, Keyboard, Alert } from "react-native";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";

export interface AddVesselFormData {
    name: string;
    type: string;
    registration: string;
}

interface AddVesselModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: AddVesselFormData) => void;
    loading: boolean;
}

/**
 * Modal component for adding a new vessel to the logbook
 * Encapsulates the form state locally to prevent unnecessary re-renders on the main profile screen
 * Passes the completed form data object back up to the parent controller on submit
 */
export const AddVesselModal: React.FC<AddVesselModalProps> = ({ visible, onClose, onSubmit, loading }) => {
    const { theme } = useOwnTheme();
    const [newVessel, setNewVessel] = useState<AddVesselFormData>({ name: "", type: "", registration: "" });

    // Auto clear form when modal closes
    useEffect(() => {
        if (!visible) {
            setNewVessel({ name: "", type: "", registration: "" });
        }
    }, [visible]);

    const handleSubmit = () => {
        if (!newVessel.name.trim()) {
            Alert.alert("Required", "Please enter a vessel name.");
            return;
        }
        onSubmit(newVessel);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={styles.modalScroll}>
                    <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>New Vessel</Text>

                            <Input
                                placeholder="Vessel Name"
                                value={newVessel.name}
                                onChangeText={(t) => setNewVessel({ ...newVessel, name: t })}
                                autoCapitalize="none"
                            />
                            <Input
                                placeholder="Type (e.g. Sloop)"
                                value={newVessel.type}
                                onChangeText={(t) => setNewVessel({ ...newVessel, type: t })}
                                autoCapitalize="none"
                            />
                            <Input
                                placeholder="Registration #"
                                value={newVessel.registration}
                                onChangeText={(t) => setNewVessel({ ...newVessel, registration: t })}
                                autoCapitalize="none"
                            />

                            <View style={styles.modalActions}>
                                <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 10 }} />
                                <Button title="Save" onPress={handleSubmit} loading={loading} style={{ flex: 1, marginLeft: 10 }} />
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