import { ThemeProvider, useOwnTheme } from "@/src/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/src/database/db";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create the client
const queryClient = new QueryClient();

function RootLayoutContent() {
    const { theme } = useOwnTheme();
    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar backgroundColor={theme.colors.statusBar} translucent style={theme.isDark ? "light" : "dark"} />
        </SafeAreaProvider>
    );
}

export default function RootLayout() {
    return (
        // 1. Wrap with QueryClientProvider
        <QueryClientProvider client={queryClient}>
            {/* 2. Removed AppStateProvider (replaced by Zustand) */}
            <ThemeProvider>
                <SQLiteProvider databaseName={"logs.db"} onInit={migrateDbIfNeeded}>
                    <RootLayoutContent />
                </SQLiteProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}