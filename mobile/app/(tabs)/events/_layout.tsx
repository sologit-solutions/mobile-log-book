import { Stack } from "expo-router";
import { useOwnTheme } from "@/context/themeContext";
import {View} from "react-native";

export default function EventsLayout() {
    const { theme } = useOwnTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack
                screenOptions={{
                    headerStyle: {backgroundColor: theme.colors.background},
                    headerTintColor: theme.colors.textPrimary,
                    contentStyle: {backgroundColor: theme.colors.background},
                    headerTitleStyle: {fontWeight: 'bold'},
                }}
            >
                {/* The List Page */}
                <Stack.Screen
                    name="index"
                    options={{title: "Events", headerShown: false}}
                />

                {/* The Detail Page */}
                <Stack.Screen
                    name="[id]"
                    options={{headerShown: false, title: "Edit Event"}}
                />
            </Stack>
        </View>
    );
}