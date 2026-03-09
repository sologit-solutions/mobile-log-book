import React, { useState } from "react";
import { Modal, KeyboardAvoidingView, ScrollView, View, Text, StyleSheet, Platform } from "react-native";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";

interface EditButtonsModalProps {
    visible: boolean;
    onClose: () => void;
    buttons: { id: string; label: string }[];
    onAdd: (label: string) => void;
    onRemove: (id: string) => void;
}

/**
 * Full-screen modal for managing the quick-action buttons on the home screen
 * Maintains local state strictly for the new button input field
 * Delegates the actual array mutations up to the global Zustand store via props
 */
export const EditButtonsModal: React.FC<EditButtonsModalProps> = ({ visible, onClose, buttons, onAdd, onRemove }) => {
    const { theme } = useOwnTheme();
    const [newButtonLabel, setNewButtonLabel] = useState("");

    const handleAdd = () => {
        if (!newButtonLabel.trim()) return;
        onAdd(newButtonLabel.trim());
        setNewButtonLabel("");
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.fullScreenOverlay}>
                <View style={[styles.largeModalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>

                    <Text style={[styles.largeModalTitle, { color: theme.colors.textPrimary }]}>Manage Buttons</Text>

                    <ScrollView style={styles.buttonListScroll}>
                        {buttons.length === 0 ? (
                            <Text style={{ color: theme.colors.textSecondary, textAlign: "center", marginTop: 20 }}>No buttons added yet.</Text>
                        ) : (
                            buttons.map((item) => (
                                <View key={item.id} style={[styles.buttonRowItem, { borderBottomColor: theme.colors.surface }]}>
                                    <Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>{item.label}</Text>
                                    <Button title="Remove" variant="danger" shape="small" onPress={() => onRemove(item.id)} />
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <View style={[styles.bottomControlBar, { borderTopColor: theme.colors.surface }]}>
                        <Input
                            placeholder="New Button Label"
                            value={newButtonLabel}
                            onChangeText={setNewButtonLabel}
                            style={{ width: "100%", marginBottom: 15 }}
                        />
                        <View style={styles.actionButtonRow}>
                            <Button title="Add" shape="grid" onPress={handleAdd} style={{ flex: 1, height: 55, marginRight: 10 }} />
                            <Button title="Done" variant="outline" shape="grid" onPress={onClose} style={{ flex: 1, height: 55 }} />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        padding: 20
    },
    largeModalContent: {
        flex: 1,
        borderRadius: 15,
        borderWidth: 1,
        overflow: "hidden",
        padding: 20
    },
    largeModalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    buttonListScroll: {
        flex: 1,
        marginBottom: 20
    },
    buttonRowItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1
    },
    bottomControlBar: {
        flexDirection: "column",
        borderTopWidth: 1,
        paddingTop: 15
    },
    actionButtonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between"
    }
});