import { Stack } from "expo-router";
import { useOwnTheme } from "@/context/themeContext";

export default function EventsLayout() {
    const { theme } = useOwnTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.textPrimary,
                contentStyle: { backgroundColor: theme.colors.background },
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            {/* The List Page */}
            <Stack.Screen
                name="index"
                options={{ title: "Events", headerShown: false }}
            />

            {/* The Detail Page */}
            <Stack.Screen
                name="[id]"
                options={{ title: "Edit Event" }} // Title for the detail screen
            />
        </Stack>
    );
}