import React, { useState, useEffect } from "react";
import { Modal, KeyboardAvoidingView, ScrollView, Pressable, View, Text, StyleSheet, Platform, Keyboard } from "react-native";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";

interface ForgotPasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onClose, onSubmit }) => {
    const { theme } = useOwnTheme();
    const [resetEmail, setResetEmail] = useState("");

    // Automatically clear the input field when the modal is closed
    useEffect(() => {
        if (!visible) setResetEmail("");
    }, [visible]);

    const handleSubmit = () => {
        onSubmit(resetEmail);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={styles.modalScroll}>
                    <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Reset Password</Text>
                            <Text style={{ color: theme.colors.textSecondary, marginBottom: 20, textAlign: "center" }}>
                                Enter your email to receive a reset link.
                            </Text>

                            <Input placeholder="Email" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" style={styles.bigInput} />

                            <View style={styles.modalActions}>
                                <Button title="Cancel" variant="outline" shape="grid" onPress={onClose} style={{ flex: 1, height: 55, marginRight: 10 }} />
                                <Button title="Send Link" shape="grid" onPress={handleSubmit} style={{ flex: 1, height: 55, marginLeft: 10 }} />
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
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center"
    },
    modalScroll: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        elevation: 5,
        borderWidth: 1,
        width: "100%"
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20
    },
    modalActions: {
        flexDirection: "row",
        marginTop: 20,
        width: "100%"
    },
    bigInput: {
        height: 55,
        fontSize: 16
    }
});