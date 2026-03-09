import React, { useState, useEffect } from "react";
import { Modal, KeyboardAvoidingView, ScrollView, Pressable, View, Text, StyleSheet, Platform, Keyboard, Alert } from "react-native";
import { z } from "zod";
import { Input } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useOwnTheme } from "@/src/context/ThemeContext";

const signupSchema = z
    .object({
        name: z.string().min(1, "Username is required."),
        email: z.string().email("Please enter a valid email address."),
        password: z.string().min(8, "Password must be at least 8 characters long."),
        confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Passwords do not match.",
        path: ["confirm"],
    });

export type SignupFormData = z.infer<typeof signupSchema>;

interface SignupModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: SignupFormData) => void;
    loading: boolean;
}

export const SignupModal: React.FC<SignupModalProps> = ({ visible, onClose, onSubmit, loading }) => {
    const { theme } = useOwnTheme();
    const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirm: "" });

    // Auto-reset form state when modal closes
    useEffect(() => {
        if (!visible) {
            setSignupData({ name: "", email: "", password: "", confirm: "" });
        }
    }, [visible]);

    const handleSubmit = () => {
        if (!signupData.name || !signupData.email || !signupData.password) return Alert.alert("Error", "Fill all fields");

        const validationResult = signupSchema.safeParse(signupData);

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0].message;
            return Alert.alert("Validation Error", firstError);
        }

        // Pass the validated data back to the parent controller
        onSubmit(signupData);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={styles.modalScroll}>
                    <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Create Account</Text>

                            <Input
                                placeholder="Name"
                                value={signupData.name}
                                onChangeText={(t) => setSignupData({ ...signupData, name: t })}
                                style={styles.bigInput}
                            />
                            <Input
                                placeholder="Email"
                                value={signupData.email}
                                onChangeText={(t) => setSignupData({ ...signupData, email: t })}
                                autoCapitalize="none"
                                style={styles.bigInput}
                            />
                            <Input
                                placeholder="Password"
                                value={signupData.password}
                                onChangeText={(t) => setSignupData({ ...signupData, password: t })}
                                secureTextEntry
                                style={styles.bigInput}
                            />
                            <Input
                                placeholder="Confirm Password"
                                value={signupData.confirm}
                                onChangeText={(t) => setSignupData({ ...signupData, confirm: t })}
                                secureTextEntry
                                style={styles.bigInput}
                            />

                            <View style={styles.modalActions}>
                                <Button title="Cancel" variant="outline" shape="grid" onPress={onClose} style={{ flex: 1, height: 55, marginRight: 10 }} />
                                <Button title="Sign Up" shape="grid" onPress={handleSubmit} loading={loading} style={{ flex: 1, height: 55, marginLeft: 10 }} />
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