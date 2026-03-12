import React from "react";
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";

interface VesselSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    vessels: any[];
    onSelect: (vessel: { id: string; name: string }) => void;
    onDelete: (id: string) => void;
}

/**
 * Modal component that displays a scrollable list of available vessels
 * Handles the selection of a new active logbook and manages the long-press deletion flow
 * Emits the selected or deleted vessel IDs back to the parent component
 */
export const VesselSelectorModal: React.FC<VesselSelectorModalProps> = ({ visible, onClose, vessels, onSelect, onDelete }) => {
    const { theme } = useOwnTheme();

    const handleLongPress = (id: string, name: string) => {
        Alert.alert(
            "Delete Vessel",
            `Are you sure you want to permanently delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete(id)
                }
            ]
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Vessel</Text>
                    <Text style={[styles.longPressHint, { color: theme.colors.textSecondary }]}>Long press to delete</Text>

                    <FlatList
                        data={vessels}
                        keyExtractor={(i) => i.id}
                        style={{ maxHeight: 300, width: "100%", marginBottom: 10 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.vesselCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}
                                onPress={() => onSelect({ id: item.id, name: item.name })}
                                onLongPress={() => handleLongPress(item.id, item.name)}
                                delayLongPress={500}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.vesselName, { color: theme.colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                                        {item.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                    <View style={styles.modalActions}>
                        <Button title="Close" variant="outline" onPress={onClose} style={{ flex: 1 }} />
                    </View>
                </View>
            </View>
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
        marginBottom: 5,
        textAlign: "center"
    },
    longPressHint: {
        fontSize: 12,
        textAlign: "center",
        marginBottom: 15
    },
    vesselCard: {
        padding: 20,
        borderBottomWidth: 1,
        flexDirection: "row",
        alignItems: "center" },
    vesselName: {
        fontSize: 20,
        fontWeight: "bold"
    },
    modalActions: {
        flexDirection: "row",
        marginTop: 10,
        width: "100%",
        justifyContent: "space-between"
    }
});