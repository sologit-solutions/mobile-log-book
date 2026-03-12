import React, { useEffect } from "react";
import { Modal, KeyboardAvoidingView, ScrollView, Pressable, View, Text, StyleSheet, Platform, Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirm: ""
        }
    });

    // Cleanup memory when modal closes
    useEffect(() => {
        if (!visible) {
            reset({ name: "", email: "", password: "", confirm: "" });
        }
    }, [visible, reset]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={styles.modalScroll}>
                    <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={Keyboard.dismiss}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Create Account</Text>

                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        placeholder="Name"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        style={styles.bigInput}
                                        error={errors.name?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        placeholder="Email"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="none"
                                        style={styles.bigInput}
                                        error={errors.email?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        placeholder="Password"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry
                                        style={styles.bigInput}
                                        error={errors.password?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="confirm"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        placeholder="Confirm Password"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry
                                        style={styles.bigInput}
                                        error={errors.confirm?.message}
                                    />
                                )}
                            />

                            <View style={styles.modalActions}>
                                <Button title="Cancel" variant="outline" shape="grid" onPress={onClose} style={{ flex: 1, height: 55, marginRight: 10 }} />
                                <Button title="Sign Up" shape="grid" onPress={handleSubmit(onSubmit)} loading={loading} style={{ flex: 1, height: 55, marginLeft: 10 }} />
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