import { ThemeProvider, useOwnTheme } from "@/src/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SQLiteProvider } from "expo-sqlite";
import { MigrationService } from '@/src/database/MigrationService';
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
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <SQLiteProvider databaseName={"logs.db"} onInit={MigrationService.migrateDbIfNeeded}>
                    <RootLayoutContent />
                </SQLiteProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}