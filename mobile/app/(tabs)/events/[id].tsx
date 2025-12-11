import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useOwnTheme } from "@/context/themeContext";
import React, { useMemo } from "react";

export default function EventDetail() {
    // Grab the ID from the URL
    const { id } = useLocalSearchParams();
    const { theme } = useOwnTheme();

    const styles = useMemo(() => createStyles(theme), [theme]);

    const router = useRouter();

    const handleBack = () => {

        //router.replace("../events");
        //router.push("/events");
        router.back()
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{
                title: "Event Details",
                headerShown: false,
            }} />

            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={[styles.text, { color: theme.colors.textPrimary }]}>
                Editing Event
            </Text>
            <Text style={[styles.text, { color: theme.colors.textPrimary }]}>
                ID: {id}
            </Text>
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        backButton: {
            position: "absolute",
            top: 20,
            left: 20,
            backgroundColor: theme.colors.surface,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            zIndex: 10,
        },
        backText: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
        },
        text: {
            fontSize: 18,
        },
    });