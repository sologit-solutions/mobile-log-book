import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useOwnTheme } from '@/src/context/ThemeContext';

interface ScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /**
     * If true, uses a simple View instead of SafeAreaView.
     * Useful if you want to handle safe areas manually or use a specific header.
     */
    unsafe?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({ children, style, unsafe = false }) => {
    const { theme } = useOwnTheme();

    // 2. We use a ternary to decide which component to render.
    // However, SafeAreaView and View have slightly different prop signatures,
    // so we cast 'Container' to 'any' or a compatible type to avoid TS errors in strict mode.
    // A cleaner React pattern is to render them conditionally directly.
    const Wrapper = unsafe ? View : SafeAreaView;

    return (
        <Wrapper style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
            <StatusBar
                style={theme.isDark ? "light" : "dark"}
                backgroundColor={theme.colors.statusBar}
                translucent
            />
            {/* The wrapper handles the safe area padding.
                The inner View is redundant if 'style' is applied to Wrapper,
                but we keep it for structure consistency if you add specific content padding later.
            */}
            <View style={styles.content}>
                {children}
            </View>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
    }
});